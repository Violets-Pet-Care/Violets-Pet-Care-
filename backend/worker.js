/**
 * Violet's Pet Care API — Cloudflare Workers + D1
 * Secrets required: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, ADMIN_API_KEY
 * D1 binding required: DB
 * Set SQUARE_ENVIRONMENT to "sandbox" until tested; "production" for live payments.
 */
const ORIGIN = "https://violets-pet-care.github.io";
const CORS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
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
  const total = Number.isInteger(quote.totalCents) ? usd(quote.totalCents) : "To be confirmed";
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
  let adminEmailSent = false;
  let customerEmailSent = null;
  if (env.ADMIN_NOTIFICATION_EMAIL) {
    adminEmailSent = await sendResendEmail(env, {
      to: env.ADMIN_NOTIFICATION_EMAIL,
      subject: "New Violet's Pet Care visit request",
      text: details,
      html: "<h2>New visit request</h2><pre style=\"white-space:pre-wrap;font-family:Arial,sans-serif\">" + escapeHtml(details) + "</pre>"
    });
  }
  if (String(input.email || "").trim()) {
    customerEmailSent = await sendResendEmail(env, {
      to: String(input.email).trim(),
      subject: "We received your Violet's Pet Care request",
      text: "Hi " + name + ",\n\nThanks for contacting Violet's Pet Care. Your request has been received and is pending review. This is not a confirmed appointment and no payment has been taken. Violet will follow up to confirm availability, care details, and the final price. Please wait for an approved Square payment link before paying.\n\nRequest reference: " + id,
      html: "<p>Hi " + escapeHtml(name) + ",</p><p>Thanks for contacting Violet's Pet Care. Your request has been received and is pending review.</p><p><strong>This is not a confirmed appointment, and no payment has been taken.</strong> Violet will follow up to confirm availability, care details, and the final price. Please wait for an approved Square payment link before paying.</p><p>Request reference: " + escapeHtml(id) + "</p>"
    });
  }
  return {adminEmailSent, customerEmailSent};
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


function b64urlEncode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
}
function b64urlDecode(text) {
  const base = text.replace(/-/g,"+").replace(/_/g,"/");
  const binary = atob(base + "=".repeat((4 - base.length % 4) % 4));
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
async function hmac(secret, message) {
  const key = await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(message)));
}
function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
async function makeAdminSession(env) {
  const payload = b64urlEncode(JSON.stringify({exp:Math.floor(Date.now()/1000)+8*60*60,sub:"admin"}));
  const sig = bytesToBase64(await hmac(env.ADMIN_SESSION_SECRET,payload)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  return payload + "." + sig;
}
async function validAdminSession(request,env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !env.ADMIN_SESSION_SECRET) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const expected = await hmac(env.ADMIN_SESSION_SECRET,parts[0]);
    const actualText = parts[1].replace(/-/g,"+").replace(/_/g,"/");
    const actual = Uint8Array.from(atob(actualText + "=".repeat((4-actualText.length%4)%4)),c=>c.charCodeAt(0));
    if (actual.length !== expected.length || !actual.every((v,i)=>v===expected[i])) return false;
    const payload = JSON.parse(b64urlDecode(parts[0]));
    return payload.sub === "admin" && payload.exp > Math.floor(Date.now()/1000);
  } catch { return false; }
}
async function verifyResendWebhook(request,env,rawBody) {
  const secret = env.RESEND_WEBHOOK_SECRET || "";
  if (!secret) return false;
  const id = request.headers.get("svix-id") || "";
  const timestamp = request.headers.get("svix-timestamp") || "";
  const signatures = request.headers.get("svix-signature") || "";
  if (!id || !timestamp || !signatures || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Math.floor(Date.now()/1000)-Number(timestamp)) > 5*60) return false;
  const encoded = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let secretBytes;
  try { secretBytes = Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)); } catch { return false; }
  const key = await crypto.subtle.importKey("raw",secretBytes,{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(id+"."+timestamp+"."+rawBody)));
  const expected = bytesToBase64(digest);
  return signatures.split(" ").some(item => {
    const parts = item.split(",");
    return parts.length===2 && parts[0]==="v1" && parts[1]===expected;
  });
}
async function adminAuth(request, env) {
  const token = request.headers.get("Authorization") || "";
  if (env.ADMIN_API_KEY && token === "Bearer " + env.ADMIN_API_KEY) return true;
  return validAdminSession(request,env);
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
      if ((url.pathname === "/" || url.pathname === "/health") && request.method === "GET") {
        return json({service:"Violet's Pet Care API",status:"ok",routes:["POST /api/admin/login","POST /api/resend/webhook","GET /api/admin/emails","PATCH /api/admin/emails/{id}","POST /api/quote","POST /api/intake","POST /api/requests","GET /api/admin/requests","POST /api/admin/requests/{id}/approve","PATCH /api/admin/requests"]});
      }

      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return json({error:"Admin login is not configured yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET as Worker secrets."},503);
        const body = await request.json();
        if (typeof body.password !== "string" || body.password.length < 1 || body.password.length > 200) return json({error:"Enter your admin password."},400);
        if (body.password !== env.ADMIN_PASSWORD) return json({error:"Incorrect password."},401);
        return json({token:await makeAdminSession(env),expiresIn:28800});
      }
      if (url.pathname === "/api/resend/webhook" && request.method === "POST") {
        const rawBody = await request.text();
        if (!await verifyResendWebhook(request,env,rawBody)) return json({error:"Invalid webhook signature."},401);
        const event = JSON.parse(rawBody);
        if (event.type !== "email.received") return json({received:true,ignored:true});
        const emailId = String(event.data?.email_id || event.data?.email?.id || "");
        if (!emailId) return json({error:"Webhook event is missing email_id."},400);
        const exists = await env.DB.prepare("SELECT id FROM inbound_emails WHERE resend_email_id=?").bind(emailId).first();
        if (exists) return json({received:true,duplicate:true});
        const detailsResponse = await fetch("https://api.resend.com/emails/receiving/" + encodeURIComponent(emailId), {
          headers: {"Authorization":"Bearer " + env.RESEND_API_KEY}
        });
        if (!detailsResponse.ok) {
          console.error("Could not fetch received email content:",detailsResponse.status);
          return json({error:"Could not retrieve email content from Resend."},502);
        }
        const details = await detailsResponse.json();
        const from = String(details.from || event.data?.from || "").slice(0,320);
        const to = JSON.stringify(Array.isArray(details.to) ? details.to : (details.to ? [details.to] : (event.data?.to || [])));
        const subject = String(details.subject || event.data?.subject || "(No subject)").slice(0,500);
        const textBody = String(details.text || "").slice(0,50000);
        const htmlBody = String(details.html || "").slice(0,100000);
        const receivedAt = String(details.created_at || event.created_at || new Date().toISOString());
        await env.DB.prepare("INSERT INTO inbound_emails (id,resend_email_id,received_at,sender,recipients,subject,text_body,html_body,is_read) VALUES (?,?,?,?,?,?,?,?,0)")
          .bind(crypto.randomUUID(),emailId,receivedAt,from,to,subject,textBody,htmlBody).run();
        return json({received:true,saved:true});
      }
      if (url.pathname === "/api/admin/emails" && request.method === "GET") {
        if (!await adminAuth(request,env)) return json({error:"Unauthorized"},401);
        const {results} = await env.DB.prepare("SELECT id,resend_email_id,received_at,sender,recipients,subject,text_body,html_body,is_read FROM inbound_emails ORDER BY received_at DESC LIMIT 100").all();
        return json({emails:results});
      }
      if (url.pathname.startsWith("/api/admin/emails/") && request.method === "PATCH") {
        if (!await adminAuth(request,env)) return json({error:"Unauthorized"},401);
        const emailId = decodeURIComponent(url.pathname.slice("/api/admin/emails/".length));
        const body = await request.json();
        if (body.isRead !== true && body.isRead !== false) return json({error:"Provide isRead true or false."},400);
        const result = await env.DB.prepare("UPDATE inbound_emails SET is_read=? WHERE id=?").bind(body.isRead?1:0,emailId).run();
        if (!result.meta.changes) return json({error:"Email not found."},404);
        return json({id:emailId,isRead:body.isRead});
      }
      if (url.pathname === "/api/quote" && request.method === "POST") {
        const input = await request.json();
        return json({quote:calculateQuote(input)});
      }
      if (url.pathname === "/api/intake" && request.method === "POST") {
        const input = await request.json();
        const required = ["name","phone","service","petDetails"];
        for (const field of required) if (!String(input[field] || "").trim()) return json({error:"Missing required field: "+field},400);
        if (String(input.name).length>120 || String(input.phone).length>40 || String(input.petDetails).length>3000) return json({error:"A field is too long."},400);
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();
        const serviceDate = String(input.serviceDate || "Flexible / not specified").slice(0,80);
        const serviceTime = String(input.serviceTime || "Flexible / not specified").slice(0,80);
        const petDetails = "Requested service: " + String(input.service).trim().slice(0,160) + "\nPets: " + String(input.petDetails).trim();
        const notes = String(input.notes || "").slice(0,5000);
        const quote = {kind:"intake",totalCents:null};
        await env.DB.prepare("INSERT INTO visit_requests (id, created_at, status, customer_name, phone, email, service_date, service_time, address, pet_details, notes, quote_json, quote_cents) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
          .bind(id,createdAt,String(input.name).trim(),String(input.phone).trim(),String(input.email||"").trim().slice(0,254),serviceDate,serviceTime,String(input.address||"").slice(0,500),petDetails,notes,JSON.stringify(quote),0).run();
        const emailStatus = await sendRequestNotifications(env, {id,input:{...input,name:String(input.name).trim(),phone:String(input.phone).trim(),email:String(input.email||"").trim(),serviceDate,serviceTime,address:String(input.address||""),petDetails,notes},quote,createdAt});
        return json({id,status:"pending",saved:true,emailStatus,message:"Your intake was saved. This is a request, not a confirmed appointment."},201);
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
        const emailStatus = await sendRequestNotifications(env, {id, input, quote, createdAt});
        return json({id,status:"pending",quoteCents:quote.totalCents,emailStatus,message:"Request received. This is not a confirmed appointment. Wait for Violet to approve the visit and send a payment link."},201);
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
