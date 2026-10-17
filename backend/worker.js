/**
 * Violet's Pet Care API — Cloudflare Workers + D1
 * Secrets required: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, ADMIN_API_KEY
 * D1 binding required: DB
 * Set SQUARE_ENVIRONMENT to "sandbox" until tested; "production" for live payments.
 */
const ORIGIN = "https://violets-pet-care.github.io";
const CORS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Vary": "Origin"
};
const json = (data, status=200) => new Response(JSON.stringify(data), {
  status, headers: {...CORS, "Content-Type":"application/json; charset=utf-8", "Cache-Control":"no-store"}
});
const cents = n => Math.round(Number(n) * 100);
const usd = n => (n/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

function calculateQuote(input) {
  const service = Number(input.serviceCents);
  const dogs = Math.max(0, Math.min(30, Math.floor(Number(input.dogs)||0)));
  const cats = Math.max(0, Math.min(30, Math.floor(Number(input.cats)||0)));
  const visits = Math.max(1, Math.min(60, Math.floor(Number(input.visits)||1)));
  const boxes = Math.max(0, Math.min(30, Math.floor(Number(input.litterBoxes)||0)));
  const photoPets = input.photoUpdates ? dogs + cats : 0;
  const medicationPets = input.medication ? Math.max(1, Math.min(30, Math.floor(Number(input.medicationPets)||1))) : 0;
  if (![4500,8000].includes(service)) throw new Error("Invalid service price.");
  const base = service * visits;
  // First pet is included in the base visit; additional pets are charged by species.
  const includedDog = dogs > 0 ? 1 : 0;
  const includedCat = includedDog === 0 && cats > 0 ? 1 : 0;
  const petFees = (Math.max(0,dogs-includedDog)*1000 + Math.max(0,cats-includedCat)*500)*visits;
  // Discounts apply to the relevant species' additional-pet charges, not the base visit.
  const dogDiscount = dogs >= 3 ? Math.round(Math.max(0,dogs-includedDog)*1000*visits*0.05) : 0;
  const catDiscount = cats >= 3 ? Math.round(Math.max(0,cats-includedCat)*500*visits*0.03) : 0;
  const litter = boxes * 1500 * visits;
  const photos = photoPets * 500 * visits;
  const medication = medicationPets * 1000 * visits;
  const subtotal = Math.max(0, base + petFees - dogDiscount - catDiscount + litter + photos + medication);
  const tipPercent = [0,0.10,0.15,0.20].includes(Number(input.tipPercent)) ? Number(input.tipPercent) : 0;
  const tip = Math.round(subtotal * tipPercent);
  return {serviceCents:service,dogs,cats,visits,litterBoxes:boxes,photoPets,medicationPets,baseCents:base,petFeesCents:petFees,dogDiscountCents:dogDiscount,catDiscountCents:catDiscount,litterCents:litter,photosCents:photos,medicationCents:medication,tipCents:tip,totalCents:subtotal+tip};
}
async function adminAuth(request, env) {
  const token = request.headers.get("Authorization") || "";
  return Boolean(env.ADMIN_API_KEY && token === "Bearer " + env.ADMIN_API_KEY);
}
async function createSquareLink(env, amountCents, requestId) {
  const sandbox = env.SQUARE_ENVIRONMENT === "sandbox";
  const base = sandbox ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com";
  const response = await fetch(base + "/v2/online-checkout/payment-links", {
    method:"POST",
    headers:{
      "Authorization":"Bearer " + env.SQUARE_ACCESS_TOKEN,
      "Content-Type":"application/json",
      "Square-Version":"2026-09-16"
    },
    body:JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      quick_pay:{
        name:"Violet's Pet Care — Approved Visit " + requestId,
        price_money:{amount:amountCents,currency:"USD"},
        location_id:env.SQUARE_LOCATION_ID
      },
      payment_note:"Violet's Pet Care booking request " + requestId
    })
  });
  const result = await response.json();
  if (!response.ok || !result.payment_link?.url) {
    throw new Error("Square did not create a payment link: " + JSON.stringify(result.errors || []));
  }
  return {url:result.payment_link.url,id:result.payment_link.id};
}
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null,{status:204,headers:CORS});
    const url = new URL(request.url);
    try {
      if (url.pathname === "/api/quote" && request.method === "POST") {
        const input = await request.json();
        return json({quote:calculateQuote(input)});
      }
      if (url.pathname === "/api/requests" && request.method === "POST") {
        const input = await request.json();
        const quote = calculateQuote(input.quote || {});
        const required = ["name","phone","serviceDate","serviceTime","petDetails"];
        for (const field of required) if (!String(input[field]||"").trim()) return json({error:"Missing required field: "+field},400);
        if (String(input.name).length>120 || String(input.phone).length>40 || String(input.petDetails).length>3000) return json({error:"A field is too long."},400);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        await env.DB.prepare("INSERT INTO visit_requests (id, created_at, status, customer_name, phone, email, service_date, service_time, address, pet_details, notes, quote_json, quote_cents) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(id,createdAt,String(input.name).trim(),String(input.phone).trim(),String(input.email||"").trim().slice(0,254),String(input.serviceDate),String(input.serviceTime),String(input.address||"").slice(0,500),String(input.petDetails).trim(),String(input.notes||"").slice(0,3000),JSON.stringify(quote),quote.totalCents).run();
        return json({id,status:"pending",quoteCents:quote.totalCents,message:"Request received. This is not a confirmed appointment. Wait for Violet to approve the visit and send a payment link."},201);
      }
      if (url.pathname === "/api/admin/requests" && request.method === "GET") {
        if (!await adminAuth(request,env)) return json({error:"Unauthorized"},401);
        const {results} = await env.DB.prepare("SELECT id,created_at,status,customer_name,phone,email,service_date,service_time,address,pet_details,notes,quote_json,quote_cents,approved_cents,payment_url FROM visit_requests ORDER BY created_at DESC LIMIT 100").all();
        return json({requests:results});
      }
      const approveMatch = url.pathname.match(/^\/api\/admin\/requests\/([a-f0-9-]+)\/approve$/i);
      if (approveMatch && request.method === "POST") {
        if (!await adminAuth(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        const requestId = approveMatch[1];
        const row = await env.DB.prepare("SELECT id,status,quote_cents FROM visit_requests WHERE id=?").bind(requestId).first();
        if (!row) return json({error:"Request not found"},404);
        if (row.status !== "pending") return json({error:"Only pending requests can be approved."},409);
        const amountCents = Number.isInteger(body.approvedCents) ? body.approvedCents : row.quote_cents;
        if (!Number.isInteger(amountCents) || amountCents < 100 || amountCents > 10000000) return json({error:"Approved amount must be between $1 and $100,000."},400);
        const link = await createSquareLink(env,amountCents,requestId);
        await env.DB.prepare("UPDATE visit_requests SET status='approved_awaiting_payment', approved_cents=?, payment_url=?, square_payment_link_id=? WHERE id=? AND status='pending'")
          .bind(amountCents,link.url,link.id,requestId).run();
        return json({id:requestId,status:"approved_awaiting_payment",approvedCents:amountCents,approvedTotal:usd(amountCents),paymentUrl:link.url});
      }
      if (url.pathname === "/api/admin/requests" && request.method === "PATCH") {
        if (!await adminAuth(request,env)) return json({error:"Unauthorized"},401);
        const body = await request.json();
        if (!body.id || !["declined","cancelled"].includes(body.status)) return json({error:"Provide id and status declined or cancelled."},400);
        const result = await env.DB.prepare("UPDATE visit_requests SET status=? WHERE id=? AND status='pending'").bind(body.status,body.id).run();
        if (!result.meta.changes) return json({error:"Pending request not found."},404);
        return json({id:body.id,status:body.status});
      }
      return json({error:"Not found"},404);
    } catch (err) {
      return json({error:err instanceof Error ? err.message : "Server error"},500);
    }
  }
};
