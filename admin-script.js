const STORAGE_KEY = "violetsPetCareAdminData";

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
      price: 45,
      status: "Confirmed"
    },
    {
      date: "2026-10-11",
      pet: "Luna",
      client: "Kelly Martin",
      service: "60-Min Drop-In",
      price: 80,
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
      price: "$45",
      description: "Potty break, food/water, and a quick update."
    },
    {
      name: "60-Min Drop-In",
      price: "$80",
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

function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const validEmail = "admin@violetspetcare.com";
  const validPassword = "password123";

  if (email === validEmail && password === validPassword) {
    appData.isLoggedIn = true;
    saveData();
    showDashboard();
  } else {
    alert("Invalid email or password. Try the demo credentials.");
  }
}

function handleDemoLogin() {
  document.getElementById("email").value = "admin@violetspetcare.com";
  document.getElementById("password").value = "password123";
  handleLogin({ preventDefault: () => {} });
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
  renderServices();
  renderEarnings();
}

function logout() {
  appData.isLoggedIn = false;
  saveData();
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("dashboardContent").style.display = "none";
  document.getElementById("loginForm").reset();
}

function switchPage(pageName) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${pageName}`).classList.add("active");

  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.querySelector(`[data-page="${pageName}"]`).classList.add("active");
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
function initRoutePlanner(){
 if(!re("routeDate"))return;re("routeDate").value=new Date().toISOString().slice(0,10);
 re("routeDate").addEventListener("change",()=>{nearbyOnly=false;drawDailyRoute();});
 re("routeAddStop").addEventListener("click",addDailyStop);re("routeOptimize").addEventListener("click",sortDailyStops);
 re("routeGroupTown").addEventListener("click",()=>{sortDailyStops();alert("Stops grouped by town and appointment time.");});
 re("routeNearby").addEventListener("click",()=>{nearbyOnly=!nearbyOnly;drawDailyRoute();});
 re("routeGoogleMaps").addEventListener("click",()=>dailyDirections("google"));re("routeAppleMaps").addEventListener("click",()=>dailyDirections("apple"));
 re("routeClear").addEventListener("click",()=>{if(confirm("Remove all stops saved for "+rdate()+"?")){const d=rdate();dailyStops=dailyStops.filter(s=>s.date!==d);saveDailyStops();drawDailyRoute();}});
 re("routeAddress").addEventListener("keydown",e=>{if(e.key==="Enter")addDailyStop();});
 re("routeStopsList").addEventListener("click",e=>{const b=e.target.closest("[data-rstatus]"),d=e.target.closest("[data-rremove]");if(b){const s=dailyStops.find(x=>x.id===b.dataset.rid);if(s){s.status=b.dataset.rstatus;saveDailyStops();drawDailyRoute();}}if(d){dailyStops=dailyStops.filter(x=>x.id!==d.dataset.rremove);saveDailyStops();drawDailyRoute();}});
 drawDailyRoute();
}

// Event Listeners
document.getElementById("loginForm").addEventListener("submit", handleLogin);
document.getElementById("demoLoginBtn").addEventListener("click", handleDemoLogin);
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
if (appData.isLoggedIn) {
  showDashboard();
}
