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
  if (![4000,7000].includes(service)) throw new Error("Invalid service price. Select $40 for 30 minutes or $70 for 60 minutes.");
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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
async function sendResendEmail(env, {to, subject, text, html}) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !to) {
    console.warn("Resend email skipped: configure RESEND_API_KEY, RESEND_FROM_EMAIL, and recipient.");
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {"Authorization": "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json"},
      body: JSON.stringify({from: env.RESEND_FROM_EMAIL, to: [to], subject, text, html})
    });
    if (!response.ok) {
      console.error("Resend email failed:", response.status, (await response.text()).slice(0, 1000));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend request failed:", error instanceof Error ? error.message : "Network error");
    return false;
  }
}
async function sendRequestNotifications(env, {id, input, quote, createdAt}) {
  const name = String(input.name).trim();
  const total = usd(quote.totalCents);
  const details = [
    "New pet-care request #" + id,
    "Name: " + name,
    "Phone: " + String(input.phone).trim(),
    "Email: " + String(input.email || "").trim(),
    "Requested date/time: " + input.serviceDate + " " + input.serviceTime,
    "Address: " + String(input.address || "Not provided"),
    "Pets: " + String(input.petDetails).trim(),
    "Estimated quote: " + total,
    "Notes: " + String(input.notes || "None"),
    "Received: " + createdAt,
    "This request is pending and is not a confirmed appointment."
  ].join("\n");
  if (env.ADMIN_NOTIFICATION_EMAIL) {
    await sendResendEmail(env, {
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: "New Violet's Pet Care visit request",
      text: details,
      html: "<h2>New visit request</h2><pre style=\"white-space:pre-wrap;font-family:Arial,sans-serif\">" + escapeHtml(details) + "</pre>"
    });
  }
  if (String(input.email || "").trim()) {
    await sendResendEmail(env, {
      to: String(input.email).trim(),
      subject: "We received your Violet's Pet Care request",
      text: "Hi " + name + ",\n\nThanks for contacting Violet's Pet Care. Your request has been received and is pending review. This is not a confirmed appointment and no payment has been taken. Violet will follow up to confirm availability, care details, and the final price. Please wait for an approved Square payment link before paying.\n\nRequest reference: " + id,
      html: "<p>Hi " + escapeHtml(name) + ",</p><p>Thanks for contacting Violet's Pet Care. Your request has been received and is pending review.</p><p><strong>This is not a confirmed appointment, and no payment has been taken.</strong> Violet will follow up to confirm availability, care details, and the final price. Please wait for an approved Square payment link before paying.</p><p>Request reference: " + escapeHtml(id) + "</p>"
    });
  }
}
async function sendApprovalEmail(env, {email, name, id, amountCents, paymentUrl}) {
  if (!email) return;
  await sendResendEmail(env, {
    to: email,
    subject: "Your Violet's Pet Care request is approved",
    text: "Hi " + (name || "there") + ",\n\nViolet has approved your pet-care request. Approved total: " + usd(amountCents) + ". Complete payment using this secure Square checkout link: " + paymentUrl + "\n\nYour appointment is not confirmed until payment and final scheduling are acknowledged by Violet. Request reference: " + id,
    html: "<p>Hi " + escapeHtml(name || "there") + ",</p><p>Violet has approved your pet-care request.</p><p><strong>Approved total: " + usd(amountCents) + "</strong></p><p><a href=\"" + escapeHtml(paymentUrl) + "\">Continue to secure Square checkout</a></p><p>Your appointment is not confirmed until payment and final scheduling are acknowledged by Violet.</p><p>Request reference: " + escapeHtml(id) + "</p>"
  });
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
        await sendRequestNotifications(env, {id, input, quote, createdAt});
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
        const row = await env.DB.prepare("SELECT id,status,quote_cents,customer_name,email FROM visit_requests WHERE id=?").bind(requestId).first();
        if (!row) return json({error:"Request not found"},404);
        if (row.status !== "pending") return json({error:"Only pending requests can be approved."},409);
        const amountCents = Number.isInteger(body.approvedCents) ? body.approvedCents : row.quote_cents;
        if (!Number.isInteger(amountCents) || amountCents < 100 || amountCents > 10000000) return json({error:"Approved amount must be between $1 and $100,000."},400);
        const link = await createSquareLink(env,amountCents,requestId);
        await env.DB.prepare("UPDATE visit_requests SET status='approved_awaiting_payment', approved_cents=?, payment_url=?, square_payment_link_id=? WHERE id=? AND status='pending'")
          .bind(amountCents,link.url,link.id,requestId).run();
        await sendApprovalEmail(env, {email:row.email, name:row.customer_name, id:requestId, amountCents, paymentUrl:link.url});
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
