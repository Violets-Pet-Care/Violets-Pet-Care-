// Calculator Variables
const numPetsInput = document.getElementById('numPets');
const serviceRadios = document.querySelectorAll('input[name="service"]');
const planTabs = document.querySelectorAll('.plan-tab');
const planInputs = document.querySelectorAll('.plan-input');
const visitCountInput = document.getElementById('visitCount');
const packageSizeSelect = document.getElementById('packageSize');
const monthlyVisitsSelect = document.getElementById('monthlyVisits');
const addonCheckboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');

const serviceCostEl = document.getElementById('serviceCost');
const petDiscountEl = document.getElementById('petDiscount');
const packageDiscountEl = document.getElementById('packageDiscount');
const addOnsCostEl = document.getElementById('addOnsCost');
const totalCostEl = document.getElementById('totalCost');

const saveQuoteBtn = document.getElementById('saveQuote');
const copyQuoteBtn = document.getElementById('copyQuote');
const stripeCheckoutBtn = document.getElementById('stripeCheckoutBtn');

// Route Planner Variables
const startingPointInput = document.getElementById('startingPoint');
const stopAddressInput = document.getElementById('stopAddress');
const stopTownSelect = document.getElementById('stopTown');
const stopEarningsInput = document.getElementById('stopEarnings');
const addStopBtn = document.getElementById('addStopBtn');
const stopsList = document.getElementById('stopsList');
const groupByTownBtn = document.getElementById('groupByTownBtn');
const optimizeRouteBtn = document.getElementById('optimizeRouteBtn');
const openMapsBtn = document.getElementById('openMapsBtn');
const clearRouteBtn = document.getElementById('clearRouteBtn');

const totalStopsEl = document.getElementById('totalStops');
const totalEarningsEl = document.getElementById('totalEarnings');
const driveTimeEl = document.getElementById('driveTime');
const fuelCostEl = document.getElementById('fuelCost');
const netProfitEl = document.getElementById('netProfit');
const groupedStopsEl = document.getElementById('groupedStops');

// Modal
const calculatorModal = document.getElementById('calculatorModal');
const stripeModal = document.getElementById('stripeModal');
const modalClose = document.querySelector('.modal-close');
const btnServices = document.querySelectorAll('.btn-service');
const navCalculator = document.querySelector('.nav-calculator');

// Data
let stops = [];
let currentPlan = 'one-time';

// Distance data (approx miles between locations in NC)
const distanceData = {
  'hickory': { 'granite-falls': 25, 'hudson': 15, 'other': 20 },
  'granite-falls': { 'hickory': 25, 'hudson': 35, 'other': 30 },
  'hudson': { 'hickory': 15, 'granite-falls': 35, 'other': 20 },
  'other': { 'hickory': 20, 'granite-falls': 30, 'hudson': 20 }
};

// Fuel settings
const fuelEfficiency = 22; // MPG
const fuelPrice = 3.50; // per gallon

// =========================
// CALCULATOR FUNCTIONS
// =========================

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function getSelectedService() {
  return Number(document.querySelector('input[name="service"]:checked').value);
}

function calculateTotal() {
  const servicePrice = getSelectedService();
  const numPets = Math.max(1, Number(numPetsInput.value) || 1);

  let visitCount = 1;
  let discount = 0;
  let addonCost = 0;

  addonCheckboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      const addonPrice = Number(checkbox.dataset.addon);
      addonCost += addonPrice;
    }
  });

  if (currentPlan === 'one-time') {
    visitCount = Math.max(1, Number(visitCountInput.value) || 1);
  } else if (currentPlan === 'package') {
    visitCount = Number(packageSizeSelect.value);
    const packageOption = packageSizeSelect.value;
    if (packageOption >= 5) discount = 0.10;
    if (packageOption >= 10) discount = 0.15;
    if (packageOption >= 15) discount = 0.20;
  } else if (currentPlan === 'monthly') {
    visitCount = Number(monthlyVisitsSelect.value);
    discount = 0.15;
  }

  let baseServiceCost = servicePrice * visitCount;
  let petDiscount = 0;

  if (numPets > 1) {
    const petDiscountAmount = baseServiceCost * 0.10 * (numPets - 1);
    petDiscount = petDiscountAmount;
  }

  let packageDiscount = 0;
  if (currentPlan === 'package' || currentPlan === 'monthly') {
    packageDiscount = baseServiceCost * discount;
  }

  const totalAddons = addonCost * visitCount;
  const grandTotal = baseServiceCost - petDiscount - packageDiscount + totalAddons;

  serviceCostEl.textContent = formatMoney(baseServiceCost);
  petDiscountEl.textContent = formatMoney(-petDiscount);
  packageDiscountEl.textContent = formatMoney(-packageDiscount);
  addOnsCostEl.textContent = formatMoney(totalAddons);
  totalCostEl.textContent = formatMoney(Math.max(0, grandTotal));
}

planTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    planTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentPlan = tab.dataset.plan;

    planInputs.forEach((input) => input.classList.add('hidden'));
    document.getElementById(`plan-${currentPlan}`).classList.remove('hidden');

    calculateTotal();
  });
});

numPetsInput.addEventListener('input', calculateTotal);
serviceRadios.forEach((radio) => radio.addEventListener('change', calculateTotal));
visitCountInput.addEventListener('input', calculateTotal);
packageSizeSelect.addEventListener('change', calculateTotal);
monthlyVisitsSelect.addEventListener('change', calculateTotal);
addonCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', calculateTotal));

saveQuoteBtn.addEventListener('click', () => {
  const quote = {
    service: getSelectedService(),
    numPets: numPetsInput.value,
    plan: currentPlan,
    total: totalCostEl.textContent,
    timestamp: new Date().toLocaleString()
  };

  localStorage.setItem('lastQuote', JSON.stringify(quote));
  alert('✅ Quote saved to your browser!');
});

copyQuoteBtn.addEventListener('click', () => {
  const quoteText = `Violet's Pet Care Quote\n\nService Cost: ${serviceCostEl.textContent}\nTotal: ${totalCostEl.textContent}\n\nGenerated: ${new Date().toLocaleString()}`;
  navigator.clipboard.writeText(quoteText).then(() => {
    alert('✅ Quote copied to clipboard!');
  });
});

stripeCheckoutBtn.addEventListener('click', () => {
  openStripeModal();
});

// =========================
// ROUTE PLANNER FUNCTIONS
// =========================

function addStop() {
  const address = stopAddressInput.value;
  const town = stopTownSelect.value;
  const earnings = Number(stopEarningsInput.value) || 0;

  if (!address || !town) {
    alert('Please enter an address and select a town');
    return;
  }

  stops.push({ address, town, earnings, id: Date.now() });
  stopAddressInput.value = '';
  stopTownSelect.value = '';
  stopEarningsInput.value = '';

  renderStops();
  updateRouteSummary();
}

function removeStop(id) {
  stops = stops.filter(stop => stop.id !== id);
  renderStops();
  updateRouteSummary();
}

window.removeStop = removeStop;

function renderStops() {
  stopsList.innerHTML = '';

  if (stops.length === 0) {
    stopsList.innerHTML = '<p style="color: #888; text-align: center;">No stops yet. Add one above!</p>';
    return;
  }

  stops.forEach(stop => {
    const stopEl = document.createElement('div');
    stopEl.className = 'stop-item';
    stopEl.innerHTML = `
      <span><strong>${stop.address}</strong><br>📍 ${stop.town.toUpperCase()} | 💰 $${stop.earnings}</span>
      <button onclick="removeStop(${stop.id})">✕ Remove</button>
    `;
    stopsList.appendChild(stopEl);
  });
}

function calculateRouteSummary() {
  const totalStops = stops.length;
  const totalEarnings = stops.reduce((sum, stop) => sum + stop.earnings, 0);

  // Estimated drive time (2 min per stop + 5 min between towns)
  let driveTime = totalStops * 2;
  const towns = new Set(stops.map(s => s.town));
  driveTime += (towns.size - 1) * 5;

  // Fuel calculation
  let totalMiles = 0;
  let lastTown = '';

  stops.forEach(stop => {
    if (lastTown && lastTown !== stop.town) {
      totalMiles += distanceData[lastTown]?.[stop.town] || 20;
    }
    lastTown = stop.town;
  });

  const fuelCost = (totalMiles / fuelEfficiency) * fuelPrice;
  const netProfit = totalEarnings - fuelCost;

  return { totalStops, totalEarnings, driveTime, fuelCost, netProfit, totalMiles };
}

function updateRouteSummary() {
  const summary = calculateRouteSummary();

  totalStopsEl.textContent = summary.totalStops;
  totalEarningsEl.textContent = formatMoney(summary.totalEarnings);
  driveTimeEl.textContent = `${Math.round(summary.driveTime)} min`;
  fuelCostEl.textContent = formatMoney(summary.fuelCost);
  netProfitEl.textContent = formatMoney(summary.netProfit);
}

function groupByTown() {
  if (stops.length === 0) {
    alert('Add stops first!');
    return;
  }

  const grouped = {};

  stops.forEach(stop => {
    if (!grouped[stop.town]) {
      grouped[stop.town] = [];
    }
    grouped[stop.town].push(stop);
  });

  groupedStopsEl.innerHTML = '';

  Object.keys(grouped).sort().forEach(town => {
    const townEl = document.createElement('div');
    townEl.className = 'town-group';
    const townEarnings = grouped[town].reduce((sum, stop) => sum + stop.earnings, 0);
    townEl.innerHTML = `
      <div class="town-group-title">📍 ${town.toUpperCase()} (${grouped[town].length} stops - $${townEarnings})</div>
      ${grouped[town].map(stop => `<div class="town-stop">• ${stop.address} ($${stop.earnings})</div>`).join('')}
    `;
    groupedStopsEl.appendChild(townEl);
  });
}

function optimizeRoute() {
  if (stops.length === 0) {
    alert('Add stops first!');
    return;
  }

  // Simple optimization: sort by town to minimize travel
  stops.sort((a, b) => a.town.localeCompare(b.town));

  renderStops();
  groupByTown();

  const summary = calculateRouteSummary();
  alert(`✅ Route optimized for profit!\n\n📍 Total Stops: ${summary.totalStops}\n💰 Total Earnings: ${formatMoney(summary.totalEarnings)}\n⛽ Fuel Cost: ${formatMoney(summary.fuelCost)}\n💵 Net Profit: ${formatMoney(summary.netProfit)}`);
}

function openMaps() {
  if (stops.length === 0) {
    alert('Add stops first!');
    return;
  }

  const start = encodeURIComponent(startingPointInput.value || 'Hickory, NC');
  const waypoints = stops.map(s => encodeURIComponent(s.address)).join('|');
  const mapsUrl = `https://www.google.com/maps/dir/${start}/${waypoints}`;

  window.open(mapsUrl, '_blank');
}

function clearRoute() {
  if (confirm('Clear all stops?')) {
    stops = [];
    startingPointInput.value = '';
    renderStops();
    updateRouteSummary();
    groupedStopsEl.innerHTML = '';
  }
}

// =========================
// MODAL FUNCTIONS
// =========================

function openCalculator() {
  calculatorModal.classList.add('show');
  calculateTotal();
}

function closeCalculator() {
  calculatorModal.classList.remove('show');
}

function openStripeModal() {
  stripeModal.classList.add('show');
}

function closeStripeModal() {
  stripeModal.classList.remove('show');
}

const modalCloseButtons = document.querySelectorAll('.modal-close');
modalCloseButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (e.target.closest('#calculatorModal')) closeCalculator();
    if (e.target.closest('#stripeModal')) closeStripeModal();
  });
});

window.addEventListener('click', (e) => {
  if (e.target === calculatorModal) closeCalculator();
  if (e.target === stripeModal) closeStripeModal();
});

btnServices.forEach(btn => {
  btn.addEventListener('click', openCalculator);
});

navCalculator.addEventListener('click', (e) => {
  e.preventDefault();
  openCalculator();
});

// Route Planner Event Listeners
addStopBtn.addEventListener('click', addStop);
groupByTownBtn.addEventListener('click', groupByTown);
optimizeRouteBtn.addEventListener('click', optimizeRoute);
openMapsBtn.addEventListener('click', openMaps);
clearRouteBtn.addEventListener('click', clearRoute);

// Stop address input - allow Enter key to add
stopAddressInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addStop();
});

// Initialize
calculateTotal();
updateRouteSummary();
