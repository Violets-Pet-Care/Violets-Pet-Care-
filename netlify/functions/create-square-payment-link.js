// Netlify Function: create one Square payment link for the full custom quote.
// Required Netlify environment variables: SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.
// Optional: SQUARE_ENVIRONMENT=sandbox (defaults to production).
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "Content-Type": "application/json", "Allow": "POST" }, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) {
    return { statusCode: 503, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Square checkout is not configured." }) };
  }

  try {
    const input = JSON.parse(event.body || "{}");
    const integer = (value, min, max, fallback = 0) => {
      const n = Number(value);
      if (!Number.isInteger(n) || n < min || n > max) throw new Error("Please check the visit and pet counts.");
      return n;
    };
    const service = integer(input.service, 45, 80);
    if (![45, 80].includes(service)) throw new Error("Please choose a valid visit type.");
    const visits = integer(input.visits, 1, 30);
    const dogs = integer(input.dogs ?? 0, 0, 20);
    const cats = integer(input.cats ?? 0, 0, 20);
    const boxes = integer(input.boxes ?? 0, 0, 20);
    const medicationPets = integer(input.medicationPets ?? 0, 0, Math.max(1, dogs + cats));
    const photoUpdates = input.photoUpdates === true;
    const tipPercent = Number(input.tipPercent ?? 0);
    if (![0, 0.1, 0.15, 0.2].includes(tipPercent)) throw new Error("Please choose a valid tip option.");
    if (dogs + cats < 1) throw new Error("Please enter at least one dog or cat.");
    if (medicationPets > dogs + cats) throw new Error("Medication count cannot exceed the number of pets.");

    const baseCents = service * 100 * visits;
    const includedDog = dogs > 0 ? 1 : 0;
    const includedCat = includedDog === 0 && cats > 0 ? 1 : 0;
    const additionalDogs = Math.max(0, dogs - includedDog);
    const additionalCats = Math.max(0, cats - includedCat);
    const petFeesCents = (additionalDogs * 1000 + additionalCats * 500) * visits;
    const dogDiscountCents = dogs >= 3 ? Math.round(baseCents * 0.05) : 0;
    const catDiscountCents = cats >= 3 ? Math.round(baseCents * 0.03) : 0;
    const litterCents = boxes * 1500 * visits;
    const photoCents = photoUpdates ? (dogs + cats) * 500 * visits : 0;
    const medicationCents = medicationPets * 1000 * visits;
    const beforeTipCents = Math.max(0, baseCents + petFeesCents - dogDiscountCents - catDiscountCents + litterCents + photoCents + medicationCents);
    const tipCents = Math.round(beforeTipCents * tipPercent);
    const totalCents = beforeTipCents + tipCents;
    if (!Number.isSafeInteger(totalCents) || totalCents < 100) throw new Error("The quote total is invalid.");

    const environment = process.env.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
    const apiBase = environment === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com";
    const quoteSummary = [
      service === 45 ? "30-minute drop-in" : "60-minute drop-in",
      visits + " visit(s)",
      dogs + " dog(s)",
      cats + " cat(s)",
      boxes + " litter box(es)",
      photoUpdates ? "photo updates included" : "no photo updates",
      medicationPets + " pet(s) receiving medication",
      "tip " + Math.round(tipPercent * 100) + "%"
    ].join("; ");

    const squareResponse = await fetch(apiBase + "/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Square-Version": "2025-10-16",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        description: "Violet's Pet Care custom quote",
        order: {
          location_id: locationId,
          line_items: [{
            name: "Violet's Pet Care — custom visit quote",
            quantity: "1",
            base_price_money: { amount: totalCents, currency: "USD" },
            note: quoteSummary
          }]
        },
        checkout_options: { allow_tipping: false },
        payment_note: "Custom pet care quote: " + quoteSummary
      })
    });
    const squareData = await squareResponse.json();
    if (!squareResponse.ok || !squareData.payment_link?.url) {
      console.error("Square checkout creation failed:", JSON.stringify(squareData.errors || squareData));
      return { statusCode: 502, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "Square could not create checkout. Please try again or contact Violet." }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ url: squareData.payment_link.url, totalCents })
    };
  } catch (error) {
    return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: error.message || "Invalid quote." }) };
  }
};
