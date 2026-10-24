const STORAGE_KEY = "violetsPetCareAdminData";
const API_BASE = "https://violets-pet-care-api.violetspetcare.workers.dev";
const ADMIN_SESSION_KEY = "violetsPetCareAdminSession";
let inboxEmails = [];

// Default sample data
const defaultData = {
  admin: {
    name: "Violet",
    email: "admin@violetspetcare.com"
  },
  isLoggedIn: false,
  bookings: [
    {
      date: "2026-10-10",
      pet: "Milo",
      client: "Sam Thompson",
      service: "30-Min Drop-In",
      price: 40,
      status: "Confirmed"
    },
    {
      date: "2026-10-11",
      pet: "Luna",
      client: "Kelly Martin",
      service: "60-Min Drop-In",
      price: 70,
      status: "Pending"
    },
    {
      date: "2026-10-12",
      pet: "Buddy",
      client: "John Doe",
      service: "Puppy Care",
      price: 95,
      status: "Confirmed"
    }
  ],
  customers: [
    {
      name: "Sam Thompson",
      email: "sam@example.com",
      phone: "(828) 555-0111",
      pets: 2,
      visits: 7
    },
    {
      name: "Kelly Martin",
      email: "kelly@example.com",
      phone: "(828) 555-0122",
      pets: 1,
      visits: 4
    },
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "(828) 555-0133",
      pets: 1,
      visits: 2
    }
  ],
  routes: [
    {
      title: "Morning Hickory Route",
      town: "Hickory",
      stops: 4,
      status: "Optimized"
    },
    {
      title: "Granite Falls Check-In",
      town: "Granite Falls",
      stops: 3,
      status: "Scheduled"
    }
  ],
  quotes: [
    {
      date: "2026-10-10",
      client: "sam@example.com",
      service: "30-Min Drop-In",
      amount: 45,
      status: "Sent"
    }
  ],
  services: [
    {
      name: "30-Min Drop-In",
      price: "$40",
      description: "Potty break, food/water, and a quick update."
    },
    {
      name: "60-Min Drop-In",
      price: "$70",
      description: "Extended visit with enrichment and walking."
    },
    {
      name: "Puppy Care",
      price: "$95",
      description: "Extra attention for young pets."
    }
  ]
};

let appData = loadData();

function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return JSON.parse(JSON.stringify(defaultData));
  }
  return JSON.parse(stored);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

async function handleLogin(e) {
  e.preventDefault();
  const password = document.getElementById("password").value;
  const submit = document.querySelector('#loginForm button[type="submit"]');
  submit.disabled = true;
  try {
    const response = await fetch(API_BASE + "/api/admin/login", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password})
    });
    const result = await response.json();
    if (!response.ok || !result.token) throw new Error(result.error || "Sign-in failed.");
    sessionStorage.setItem(ADMIN_SESSION_KEY,result.token);
    appData.isLoggedIn = true;
    showDashboard();
  } catch (error) {
    alert(error.message || "Could not sign in. Check your connection and try again.");
  } finally { submit.disabled = false; }
}

function showDashboard() {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("dashboardContent").style.display = "block";

  document.getElementById("adminName").textContent = appData.admin.name;
  document.getElementById("adminNameInput").value = appData.admin.name;
  document.getElementById("adminEmailInput").value = appData.admin.email;

  renderOverview();
  renderBookings();
  renderCustomers();
  renderRoutes();
  renderQuotes();
  renderInbox();
  renderServices();
  renderEarnings();
}

function logout() {
  appData.isLoggedIn = false;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  saveData();
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("dashboardContent").style.display = "none";
  document.getElementById("loginForm").reset();
}

function switchPage(pageName) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + pageName).classList.add("active");
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.querySelector('[data-page="' + pageName + '"]').classList.add("active");
  if (pageName === "inbox") loadInbox();
}

function renderOverview() {
  const bookings = appData.bookings;
  const todayEarnings = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const pending = bookings.filter(b => b.status === "Pending").length;

  document.getElementById("todayEarnings").textContent = `$${todayEarnings.toFixed(2)}`;
  document.getElementById("pendingBookings").textContent = pending;
  document.getElementById("totalRoutes").textContent = appData.routes.length;
  document.getElementById("totalCustomers").textContent = appData.customers.length;

  const recentContainer = document.getElementById("recentBookings");
  recentContainer.innerHTML = bookings.slice(0, 3).map(b => `
    <div class="booking-card">
      <h3>${b.pet}</h3>
      <p><strong>Client:</strong> ${b.client}</p>
      <p><strong>Service:</strong> ${b.service}</p>
      <span class="badge badge-success">${b.status}</span>
    </div>
  `).join("");
}

function renderBookings() {
  const tbody = document.getElementById("bookingsTable");
  tbody.innerHTML = appData.bookings.map(b => `
    <tr>
      <td>${b.date}</td>
      <td>${b.pet}</td>
      <td>${b.client}</td>
      <td>${b.service}</td>
      <td>$${Number(b.price).toFixed(2)}</td>
      <td><span class="badge badge-success">${b.status}</span></td>
    </tr>
  `).join("");
}

function renderCustomers() {
  const tbody = document.getElementById("customersTable");
  tbody.innerHTML = appData.customers.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.pets}</td>
      <td>${c.visits}</td>
    </tr>
  `).join("");
}

function renderRoutes() {
  const container = document.getElementById("routesList");
  container.innerHTML = appData.routes.map(r => `
    <div class="route-card">
      <h3>${r.title}</h3>
      <p><strong>Town:</strong> ${r.town}</p>
      <p><strong>Stops:</strong> ${r.stops}</p>
      <span class="badge badge-warning">${r.status}</span>
    </div>
  `).join("");
}

function renderQuotes() {
  const tbody = document.getElementById("quotesTable");
  tbody.innerHTML = appData.quotes.map(q => `
    <tr>
      <td>${q.date}</td>
      <td>${q.client}</td>
      <td>${q.service}</td>
      <td>$${Number(q.amount).toFixed(2)}</td>
      <td><span class="badge badge-success">${q.status}</span></td>
    </tr>
  `).join("");
}

function renderServices() {
  const container = document.getElementById("servicesList");
  container.innerHTML = appData.services.map(s => `
    <div class="service-card">
      <h3>${s.name}</h3>
      <p style="font-size: 1.5rem; color: var(--purple); font-weight: bold;">${s.price}</p>
      <p>${s.description}</p>
    </div>
  `).join("");
}

function renderEarnings() {
  const totalRevenue = appData.bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
  const fuelCost = totalRevenue * 0.18;
  const netProfit = totalRevenue - fuelCost;

  document.getElementById("totalRevenue").textContent = `$${totalRevenue.toFixed(2)}`;
  document.getElementById("fuelCost").textContent = `$${fuelCost.toFixed(2)}`;
  document.getElementById("netProfit").textContent = `$${netProfit.toFixed(2)}`;
}

function saveSettings() {
  appData.admin.name = document.getElementById("adminNameInput").value.trim() || appData.admin.name;
  appData.admin.email = document.getElementById("adminEmailInput").value.trim() || appData.admin.email;
  saveData();
  alert("Settings saved!");
  document.getElementById("adminName").textContent = appData.admin.name;
}


/* Private admin daily route planner */
const ROUTE_KEY="violetsPetCareDailyRouteStops";
let dailyStops=JSON.parse(localStorage.getItem(ROUTE_KEY)||"[]");
let nearbyOnly=false;
const re=id=>document.getElementById(id);
const rmoney=n=>"$"+(Number(n)||0).toFixed(2);
const rdate=()=>re("routeDate").value||new Date().toISOString().slice(0,10);
const saveDailyStops=()=>localStorage.setItem(ROUTE_KEY,JSON.stringify(dailyStops));
const todaysStops=()=>dailyStops.filter(s=>s.date===rdate());
function escRoute(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function drawDailyRoute(){
 const today=todaysStops(), visible=nearbyOnly&&today.length?today.filter(s=>s.town===today[0].town):today;
 re("routeStopsList").innerHTML=visible.length?visible.map((s,n)=>'<article class="route-stop-card"><div class="route-stop-heading"><strong>'+(n+1)+'. '+escRoute(s.time||"Time not set")+' — '+escRoute(s.client||"Client not named")+'</strong><span class="badge '+(s.status==="Checked In"?"badge-success":"badge-warning")+'">'+escRoute(s.status)+'</span></div><p><strong>Pet:</strong> '+escRoute(s.pet||"Not specified")+' · <strong>Service:</strong> '+escRoute(s.service)+' · <strong>Expected:</strong> '+rmoney(s.price)+'</p><p><strong>Address:</strong> '+escRoute(s.address)+' ('+escRoute(s.town)+')</p><div class="route-stop-actions">'+(s.phone?'<a href="tel:'+escRoute(s.phone)+'">Call</a> <a href="sms:'+escRoute(s.phone)+'">Text</a> ':'')+(s.email?'<a href="mailto:'+escRoute(s.email)+'">Email</a> ':'')+'<button class="btn btn-small" data-rstatus="En Route" data-rid="'+s.id+'">En Route</button><button class="btn btn-small" data-rstatus="Checked In" data-rid="'+s.id+'">Check In</button><button class="btn btn-small btn-secondary" data-rremove="'+s.id+'">Remove</button></div></article>').join(""):"<p>No stops saved for this date yet.</p>";
 const earnings=today.reduce((a,b)=>a+(Number(b.price)||0),0), towns=[...new Set(today.map(s=>s.town))];
 let miles=0;for(let n=1;n<towns.length;n++){const d={"Hickory|Granite Falls":18,"Granite Falls|Hickory":18,"Hickory|Hudson":10,"Hudson|Hickory":10,"Granite Falls|Hudson":20,"Hudson|Granite Falls":20};miles+=d[towns[n-1]+"|"+towns[n]]||15;}
 const mins=today.length?Math.max(0,(today.length-1)*18+Math.max(0,towns.length-1)*8):0,fuel=miles/22*3.5;
 re("routeTotalStops").textContent=today.length;re("routeTotalEarnings").textContent=rmoney(earnings);re("routeDriveTime").textContent=mins+" min";re("routeFuelCost").textContent=rmoney(fuel);re("routeNetProfit").textContent=rmoney(earnings-fuel);
}
function addDailyStop(){
 const address=re("routeAddress").value.trim();if(!address){alert("Please enter the full service address.");return;}
 dailyStops.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),date:rdate(),client:re("routeClient").value.trim(),pet:re("routePet").value.trim(),service:re("routeService").value,time:re("routeTime").value,address,town:re("routeTown").value,price:Number(re("routePrice").value)||0,phone:re("routePhone").value.trim(),email:re("routeEmail").value.trim(),status:"Scheduled"});
 saveDailyStops();["routeClient","routePet","routeTime","routeAddress","routePrice","routePhone","routeEmail"].forEach(id=>re(id).value="");nearbyOnly=false;drawDailyRoute();
}
function sortDailyStops(){const today=todaysStops().slice().sort((a,b)=>a.town.localeCompare(b.town)||(a.time||"").localeCompare(b.time||"")),ids=new Set(today.map(s=>s.id));dailyStops=dailyStops.filter(s=>!ids.has(s.id)).concat(today);saveDailyStops();nearbyOnly=false;drawDailyRoute();}
function dailyDirections(which){
 const list=todaysStops();if(!list.length){alert("Add at least one stop first.");return;}
 const start=re("routeStart").value.trim(),end=re("routeEnd").value.trim(),addresses=list.map(s=>s.address);
 if(which==="google"){const p=new URLSearchParams({api:"1",travelmode:"driving"});if(start)p.set("origin",start);p.set("destination",end||addresses.pop());if(addresses.length)p.set("waypoints",addresses.join("|"));window.open("https://www.google.com/maps/dir/?"+p.toString(),"_blank","noopener");}
 else{const dest=end||addresses.pop();window.open("https://maps.apple.com/?daddr="+encodeURIComponent([start,...addresses,dest].filter(Boolean).join(" to "))+"&dirflg=d","_blank","noopener");}
}

/* Real road routing through public OpenStreetMap/Nominatim + OSRM services.
   Public endpoints need no API key, but are community services with rate limits/no SLA. */
const routeGeocodeCache = new Map();
const routePause = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastGeocodeAt = 0;
async function geocodeRouteAddress(address) {
  const key = address.trim().toLowerCase();
  if (routeGeocodeCache.has(key)) return routeGeocodeCache.get(key);
  const wait = Math.max(0, 1100 - (Date.now() - lastGeocodeAt));
  if (wait) await routePause(wait);
  lastGeocodeAt = Date.now();
  const url = "https://nominatim.openstreetmap.org/search?" + new URLSearchParams({
    q: address, format: "jsonv2", limit: "1", countrycodes: "us", addressdetails: "1"
  });
  const response = await fetch(url, { headers: { "Accept-Language": "en-US,en;q=0.8" } });
  if (!response.ok) throw new Error("Address lookup is temporarily unavailable. Try again later.");
  const results = await response.json();
  if (!results.length) throw new Error("Could not find this address: " + address + ". Check that it includes street, town, and state.");
  const point = { lon: Number(results[0].lon), lat: Number(results[0].lat), label: results[0].display_name };
  routeGeocodeCache.set(key, point);
  return point;
}
function routeStatus(message, isError=false) {
  const node = re("routeServiceStatus");
  if (node) { node.textContent = message; node.classList.toggle("route-error", isError); }
}
async function calculateDrivingRoute() {
  const stops = todaysStops();
  if (!stops.length) { routeStatus("Add at least one appointment before calculating a route.", true); return; }
  const start = re("routeStart").value.trim();
  const end = re("routeEnd").value.trim();
  if (stops.length + (start ? 1 : 0) + (end ? 1 : 0) < 2) {
    routeStatus("Add a second stop, or enter a starting point or end point, so driving time can be calculated.", true);
    return;
  }
  const button = re("routeCalculate");
  button.disabled = true;
  const oldLabel = button.textContent;
  button.textContent = "Calculating…";
  re("routeServiceResults").innerHTML = "";
  routeStatus("Looking up addresses and calculating road distances. This can take a little time for several stops.");
  try {
    const points = [];
    if (start) points.push({ kind: "start", label: "Starting point", address: start });
    stops.forEach(s => points.push({ kind: "stop", id: s.id, label: (s.time ? s.time + " — " : "") + (s.client || s.pet || "Appointment"), address: s.address }));
    if (end) points.push({ kind: "end", label: "End point", address: end });
    const geocoded = [];
    for (const point of points) {
      const coords = await geocodeRouteAddress(point.address);
      geocoded.push({ ...point, ...coords });
    }
    const coordString = geocoded.map(p => p.lon + "," + p.lat).join(";");
    const sourceMode = start ? "first" : "any";
    const destinationMode = end ? "last" : "any";
    const routeUrl = "https://router.project-osrm.org/trip/v1/driving/" + coordString +
      "?roundtrip=false&source=" + sourceMode + "&destination=" + destinationMode + "&overview=false&steps=false";
    const response = await fetch(routeUrl);
    if (!response.ok) throw new Error("The driving-route service could not calculate this route. Please try again.");
    const data = await response.json();
    if (data.code !== "Ok" || !data.trips || !data.trips.length || !data.waypoints) {
      throw new Error("The routing service could not connect all of these addresses. Check the addresses or try fewer stops.");
    }
    const ordered = geocoded.map((p, originalIndex) => ({ ...p, routeIndex: data.waypoints[originalIndex].waypoint_index }))
      .sort((a,b) => a.routeIndex - b.routeIndex);
    const orderedStopIds = ordered.filter(p => p.kind === "stop").map(p => p.id);
    const orderMap = new Map(orderedStopIds.map((id,index) => [id,index]));
    dailyStops = dailyStops.map(s => orderMap.has(s.id) ? { ...s, _routeOrder: orderMap.get(s.id) } : s);
    const todays = dailyStops.filter(s => s.date === rdate()).sort((a,b) => (a._routeOrder ?? 9999) - (b._routeOrder ?? 9999));
    const todayIds = new Set(todays.map(s => s.id));
    dailyStops = dailyStops.filter(s => !todayIds.has(s.id)).concat(todays.map(({_routeOrder,...s})=>s));
    saveDailyStops();
    nearbyOnly = false;
    drawDailyRoute();
    const trip = data.trips[0];
    const miles = trip.distance / 1609.344;
    const minutes = trip.duration / 60;
    re("routeServiceResults").innerHTML =
      '<div class="route-live-metrics"><strong>' + miles.toFixed(1) + ' miles</strong><strong>' + Math.round(minutes) + ' min estimated driving</strong></div>' +
      '<ol class="route-live-list">' + ordered.map(p => '<li><strong>' + escRoute(p.label) + '</strong><span>' + escRoute(p.address) + '</span></li>').join("") + '</ol>' +
      '<p><a target="_blank" rel="noopener noreferrer" href="' + (function(){ const u=new URL("https://www.google.com/maps/dir/"); u.searchParams.set("api","1"); u.searchParams.set("travelmode","driving"); if(start)u.searchParams.set("origin",start); if(end)u.searchParams.set("destination",end); else u.searchParams.set("destination",ordered.filter(p=>p.kind==="stop").slice(-1)[0]?.address||ordered[ordered.length-1].address); const mids=ordered.filter(p=>p.kind==="stop"); const waypointStops=end?mids:mids.slice(0,-1); if(waypointStops.length)u.searchParams.set("waypoints",waypointStops.map(p=>p.address).join("|")); return u.toString(); })() + '">Open this stop order in Google Maps</a></p>';
    re("routeDriveTime").textContent = Math.round(minutes) + " min";
    re("routeFuelCost").textContent = rmoney((miles / 22) * 3.5);
    re("routeNetProfit").textContent = rmoney(stops.reduce((sum,s)=>sum+(Number(s.price)||0),0) - (miles / 22) * 3.5);
    routeStatus("Driving route calculated and appointments reordered using estimated road travel time.");
  } catch (error) {
    routeStatus(error.message || "Unable to calculate this route right now.", true);
  } finally {
    button.disabled = false;
    button.textContent = oldLabel;
  }
}

function initRoutePlanner(){
 if(!re("routeDate"))return;re("routeDate").value=new Date().toISOString().slice(0,10);
 re("routeDate").addEventListener("change",()=>{nearbyOnly=false;drawDailyRoute();});
 re("routeAddStop").addEventListener("click",addDailyStop);re("routeOptimize").addEventListener("click",sortDailyStops);re("routeCalculate").addEventListener("click",calculateDrivingRoute);
 re("routeGroupTown").addEventListener("click",()=>{sortDailyStops();alert("Stops grouped by town and appointment time.");});
 re("routeNearby").addEventListener("click",()=>{nearbyOnly=!nearbyOnly;drawDailyRoute();});
 re("routeGoogleMaps").addEventListener("click",()=>dailyDirections("google"));re("routeAppleMaps").addEventListener("click",()=>dailyDirections("apple"));
 re("routeClear").addEventListener("click",()=>{if(confirm("Remove all stops saved for "+rdate()+"?")){const d=rdate();dailyStops=dailyStops.filter(s=>s.date!==d);saveDailyStops();drawDailyRoute();}});
 re("routeAddress").addEventListener("keydown",e=>{if(e.key==="Enter")addDailyStop();});
 re("routeStopsList").addEventListener("click",e=>{const b=e.target.closest("[data-rstatus]"),d=e.target.closest("[data-rremove]");if(b){const s=dailyStops.find(x=>x.id===b.dataset.rid);if(s){s.status=b.dataset.rstatus;saveDailyStops();drawDailyRoute();}}if(d){dailyStops=dailyStops.filter(x=>x.id!==d.dataset.rremove);saveDailyStops();drawDailyRoute();}});
 drawDailyRoute();
}

async function loadInbox() {
  const status = document.getElementById("inboxStatus");
  const list = document.getElementById("inboxList");
  const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!token) { status.textContent = "Please sign in again to view your inbox."; list.textContent = ""; return; }
  status.textContent = "Loading messages…";
  try {
    const response = await fetch(API_BASE + "/api/admin/emails", {headers:{Authorization:"Bearer "+token}});
    const result = await response.json();
    if (response.status === 401) { logout(); throw new Error("Your session expired. Please sign in again."); }
    if (!response.ok) throw new Error(result.error || "Inbox could not be loaded.");
    inboxEmails = result.emails || [];
    renderInbox();
    status.textContent = inboxEmails.length ? inboxEmails.length + " message(s)" : "No emails received yet.";
  } catch (error) { status.textContent = error.message || "Unable to load inbox."; }
}
function renderInbox() {
  const list = document.getElementById("inboxList");
  if (!list) return;
  const unread = inboxEmails.filter(email => !email.is_read).length;
  const counter = document.getElementById("inboxUnreadCount");
  if (counter) counter.textContent = unread ? "(" + unread + " new)" : "";
  if (!inboxEmails.length) { list.innerHTML = '<p>No messages loaded. Tap “Refresh Inbox”.</p>'; return; }
  list.innerHTML = inboxEmails.map(email => {
    const sender = escapeInbox(email.sender);
    const subject = escapeInbox(email.subject || "(No subject)");
    const body = escapeInbox(email.text_body || "(This message has no plain-text body.)");
    const date = escapeInbox(new Date(email.received_at).toLocaleString());
    return '<article class="booking-card" style="margin-bottom:12px"><h3>'+(email.is_read?'':'🟣 ')+subject+'</h3><p><strong>From:</strong> '+sender+'</p><p><strong>Received:</strong> '+date+'</p><details><summary>Read message</summary><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font:inherit">'+body+'</pre><button type="button" class="btn btn-secondary" data-mark-read="'+escapeInbox(email.id)+'">'+(email.is_read?'Mark unread':'Mark read')+'</button></details></article>';
  }).join("");
}
function escapeInbox(value) { return String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); }
document.getElementById("refreshInboxBtn")?.addEventListener("click",loadInbox);
document.getElementById("inboxList")?.addEventListener("click",async e=>{
  const button=e.target.closest("[data-mark-read]"); if(!button)return;
  const email=inboxEmails.find(item=>item.id===button.dataset.markRead); if(!email)return;
  const token=sessionStorage.getItem(ADMIN_SESSION_KEY);
  try {
    const response=await fetch(API_BASE+"/api/admin/emails/"+encodeURIComponent(email.id),{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({isRead:!email.is_read})});
    const result=await response.json(); if(!response.ok)throw new Error(result.error||"Could not update message.");
    email.is_read=result.isRead?1:0; renderInbox();
  } catch(error){alert(error.message||"Could not update message.");}
});

// Event Listeners
document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("saveSettingsBtn").addEventListener("click", saveSettings);

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const pageName = link.dataset.page;
    switchPage(pageName);
  });
});

// Initialize
initRoutePlanner();
if (appData.isLoggedIn && sessionStorage.getItem(ADMIN_SESSION_KEY)) {
  showDashboard();
} else {
  appData.isLoggedIn = false;
  saveData();
}
