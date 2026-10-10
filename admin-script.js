// Admin Authentication
let adminUser = null;

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  // Demo credentials (in production, this would hit a backend)
  if (email === 'admin@violetspetcare.com' && password === 'password123') {
    adminUser = { email, name: 'Violet' };
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    document.getElementById('loginModal').classList.remove('show');
    initializeDashboard();
  } else {
    alert('Invalid credentials. Try the demo login.');
  }
}

function demoLogin() {
  document.getElementById('loginEmail').value = 'admin@violetspetcare.com';
  document.getElementById('loginPassword').value = 'password123';
  handleLogin();
}

function logout() {
  adminUser = null;
  localStorage.removeItem('adminUser');
  document.getElementById('loginModal').classList.add('show');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
}

// Initialize Dashboard
function initializeDashboard() {
  document.getElementById('adminEmail').textContent = adminUser.email;
  loadDashboardData();
}

function loadDashboardData() {
  // Load from localStorage
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const routes = JSON.parse(localStorage.getItem('routes') || '[]');
  const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
  const earnings = JSON.parse(localStorage.getItem('earnings') || '[]');

  // Update stats
  const todayEarnings = earnings
    .filter(e => new Date(e.date).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.amount, 0);

  document.getElementById('todayEarnings').textContent = `$${todayEarnings.toFixed(2)}`;
  document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'pending').length;

  // Populate recent bookings
  const recentBookingsEl = document.getElementById('recentBookings');
  if (bookings.length > 0) {
    recentBookingsEl.innerHTML = bookings.slice(0, 5).map(b => `
      <div class="booking-item">
        <strong>${b.petName}</strong> - ${b.service} ($${b.price})
        <br><small>${new Date(b.date).toLocaleDateString()}</small>
      </div>
    `).join('');
  }
}

// Page Navigation
function switchPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show selected page
  document.getElementById(`page-${pageName}`).classList.remove('hidden');
  document.querySelector(`[data-page="${pageName}"]`).classList.add('active');

  // Load page data
  if (pageName === 'bookings') loadBookings();
  if (pageName === 'customers') loadCustomers();
  if (pageName === 'quotes') loadQuotes();
  if (pageName === 'routes') loadRoutes();
  if (pageName === 'services') loadServices();
  if (pageName === 'earnings') loadEarnings();
}

// Navigation Event Listeners
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    switchPage(page);
  });
});

document.getElementById('logoutBtn').addEventListener('click', logout);

// Bookings
function loadBookings() {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  const tbody = document.getElementById('bookingsTable');

  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No bookings yet</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${new Date(b.date).toLocaleDateString()}</td>
      <td><strong>${b.petName}</strong></td>
      <td>${b.clientName}</td>
      <td>${b.service}</td>
      <td>$${b.price}</td>
      <td><span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-small" onclick="editBooking('${b.id}')">Edit</button>
      </td>
    </tr>
  `).join('');
}

function editBooking(id) {
  alert('Booking #' + id + ' - Edit feature coming soon!');
}

// Customers
function loadCustomers() {
  const customers = JSON.parse(localStorage.getItem('customers') || '[]');
  const tbody = document.getElementById('customersTable');

  if (customers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No customers yet</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.pets}</td>
      <td>${c.visits}</td>
      <td><span class="status-badge status-confirmed">ACTIVE</span></td>
      <td>
        <button class="btn btn-small" onclick="viewCustomer('${c.id}')">View</button>
      </td>
    </tr>
  `).join('');
}

function viewCustomer(id) {
  alert('Customer #' + id + ' - View details coming soon!');
}

// Quotes
function loadQuotes() {
  const quotes = JSON.parse(localStorage.getItem('quotes') || '[]');
  const tbody = document.getElementById('quotesTable');

  if (quotes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888;">No quotes yet</td></tr>';
    return;
  }

  tbody.innerHTML = quotes.map(q => `
    <tr>
      <td>${new Date(q.timestamp).toLocaleDateString()}</td>
      <td>${q.clientEmail || 'Unknown'}</td>
      <td>${q.service || 'N/A'}</td>
      <td>${q.total || '$0.00'}</td>
      <td><span class="status-badge status-pending">PENDING</span></td>
      <td>
        <button class="btn btn-small" onclick="viewQuote('${q.id}')">View</button>
      </td>
    </tr>
  `).join('');
}

function viewQuote(id) {
  const quote = JSON.parse(localStorage.getItem('quotes') || '[]').find(q => q.id === id);
  if (quote) {
    alert(`Quote #${id}\n\nService: ${quote.service}\nTotal: ${quote.total}\nDate: ${new Date(quote.timestamp).toLocaleDateString()}`);
  }
}

// Routes
function loadRoutes() {
  const routes = JSON.parse(localStorage.getItem('routes') || '[]');
  const routesList = document.getElementById('routesList');

  if (routes.length === 0) {
    routesList.innerHTML = '<p style="text-align: center; color: #888;">No routes saved yet</p>';
    return;
  }

  routesList.innerHTML = routes.map((r, idx) => `
    <div class="card">
      <h4>Route ${idx + 1}</h4>
      <p><strong>Date:</strong> ${new Date(r.date).toLocaleDateString()}</p>
      <p><strong>Stops:</strong> ${r.stops?.length || 0}</p>
      <p><strong>Earnings:</strong> $${r.earnings || '0.00'}</p>
      <p><strong>Net Profit:</strong> $${r.netProfit || '0.00'}</p>
      <button class="btn btn-small" onclick="viewRoute(${idx})">View Details</button>
    </div>
  `).join('');
}

function viewRoute(idx) {
  const routes = JSON.parse(localStorage.getItem('routes') || '[]');
  if (routes[idx]) {
    alert('Route ' + (idx + 1) + ' Details:\n\nStops: ' + routes[idx].stops?.length + '\nNet Profit: $' + routes[idx].netProfit);
  }
}

function addNewRoute() {
  alert('Redirect to main app route planner to create a route.');
  window.location.href = 'index.html#route-planner';
}

// Services
function loadServices() {
  const services = [
    { name: '30-Min Drop-In', price: 45 },
    { name: '60-Min Drop-In', price: 80 },
    { name: 'Puppy Care', price: 95 },
    { name: 'Senior Pet Care', price: 120 }
  ];

  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = services.map((s, idx) => `
    <div class="service-card">
      <h4>${s.name}</h4>
      <label>Price</label>
      <input type="number" value="${s.price}" />
      <button class="btn btn-small" onclick="saveService(${idx})">Save</button>
    </div>
  `).join('');
}

function saveService(idx) {
  alert('Service #' + idx + ' updated!');
}

// Earnings
function loadEarnings() {
  const earnings = JSON.parse(localStorage.getItem('earnings') || '[]');
  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
  const totalFuel = earnings.reduce((sum, e) => sum + (e.fuel || 0), 0);

  document.getElementById('earningsTotal').textContent = `$${totalEarnings.toFixed(2)}`;
  document.getElementById('earnignsFuel').textContent = `-$${totalFuel.toFixed(2)}`;
  document.getElementById('earningsNet').textContent = `$${(totalEarnings - totalFuel).toFixed(2)}`;

  // Breakdown
  const breakdownEl = document.getElementById('earningsBreakdown');
  if (earnings.length === 0) {
    breakdownEl.innerHTML = '<p style="text-align: center; color: #888;">No earnings data yet</p>';
  } else {
    breakdownEl.innerHTML = '<p>Earnings data will appear here</p>';
  }
}

// Settings
function saveSettings() {
  const settings = {
    name: document.getElementById('adminName').value,
    email: document.getElementById('adminEmailInput').value,
    fuelEfficiency: document.getElementById('fuelEfficiency').value,
    fuelPrice: document.getElementById('fuelPrice').value
  };

  localStorage.setItem('adminSettings', JSON.stringify(settings));
  alert('✅ Settings saved!');
}

function clearAllData() {
  if (confirm('Are you sure? This will delete all bookings, routes, and quotes.')) {
    localStorage.removeItem('bookings');
    localStorage.removeItem('routes');
    localStorage.removeItem('quotes');
    localStorage.removeItem('customers');
    localStorage.removeItem('earnings');
    alert('✅ All data cleared!');
  }
}

// Period buttons for earnings
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadEarnings();
  });
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('adminUser');
  if (saved) {
    adminUser = JSON.parse(saved);
    document.getElementById('loginModal').classList.remove('show');
    initializeDashboard();
  }
});
