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
if (appData.isLoggedIn) {
  showDashboard();
}
