// Calculator Variables
const numDogsInput=document.getElementById('numDogs');
const numCatsInput=document.getElementById('numCats');
const litterBoxesInput=document.getElementById('litterBoxes');
const tipPercentSelect=document.getElementById('tipPercent');
const serviceRadios = document.querySelectorAll('input[name="service"]');

const visitCountInput = document.getElementById('visitCount');
const photoUpdateInput = document.getElementById('photoUpdate');
const medicationNeededSelect = document.getElementById('medicationNeeded');
const medicationPetCountInput = document.getElementById('medicationPetCount');
const photoPetCountGroup = document.getElementById('photoPetCountGroup');
const medicationPetCountGroup = document.getElementById('medicationPetCountGroup');
const photoCostEl = document.getElementById('photoCost');
const medicationCostEl = document.getElementById('medicationCost');

const serviceCostEl = document.getElementById('serviceCost');
const petFeesEl = document.getElementById('petFees');
const requestCheckoutBtn = document.getElementById('requestCheckout');
const dogDiscountEl=document.getElementById('dogDiscount');
const catDiscountEl=document.getElementById('catDiscount');
const litterCostEl=document.getElementById('litterCost');
const tipCostEl=document.getElementById('tipCost');
const packageDiscountEl = document.getElementById('packageDiscount');
const addOnsCostEl = document.getElementById('addOnsCost');
const totalCostEl = document.getElementById('totalCost');

const saveQuoteBtn = document.getElementById('saveQuote');
const copyQuoteBtn = document.getElementById('copyQuote');
const stripeCheckoutBtn = document.getElementById('stripeCheckoutBtn');

// Modal
const calculatorModal = document.getElementById('calculatorModal');
const stripeModal = document.getElementById('stripeModal');
const modalClose = document.querySelector('.modal-close');
const btnServices = document.querySelectorAll('.btn-service');
const navCalculator = document.querySelector('.nav-calculator');

// Data
let stops = [];


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
  const dogs = Math.max(0, Number(numDogsInput.value) || 0);
  const cats = Math.max(0, Number(numCatsInput.value) || 0);
  const visits = Math.max(1, Number(visitCountInput.value) || 1);
  const litterBoxes = Math.max(0, Number(litterBoxesInput.value) || 0);
  const tipRate = Number(tipPercentSelect.value) || 0;
  const photoPets = photoUpdateInput.checked ? dogs + cats : 0;
  const medicationPets = medicationNeededSelect.value === 'yes' ? Math.max(1, Number(medicationPetCountInput.value) || 1) : 0;
  const base = servicePrice * visits;
  const extraDogs = Math.max(0, dogs - 1);
  const extraCats = Math.max(0, cats - (dogs > 0 ? 0 : 1));
  const petFees = (extraDogs * 10 + extraCats * 5) * visits;
  const dogDiscount = dogs >= 3 ? base * 0.05 : 0;
  const catDiscount = cats >= 3 ? base * 0.03 : 0;
  const litter = litterBoxes * 15 * visits;
  const photos = photoPets * 5 * visits;
  const medication = medicationPets * 10 * visits;
  const beforeTip = Math.max(0, base + petFees - dogDiscount - catDiscount + litter + photos + medication);
  const tip = beforeTip * tipRate;
  const total = beforeTip + tip;
  if (photoPetCountGroup) photoPetCountGroup.classList.toggle('hidden', !photoUpdateInput.checked);
  if (medicationPetCountGroup) medicationPetCountGroup.classList.toggle('hidden', medicationNeededSelect.value !== 'yes');
  serviceCostEl.textContent = formatMoney(base);
  if (petFeesEl) petFeesEl.textContent = formatMoney(petFees);
  dogDiscountEl.textContent = formatMoney(-dogDiscount);
  catDiscountEl.textContent = formatMoney(-catDiscount);
  if (packageDiscountEl) packageDiscountEl.textContent = formatMoney(0);
  if (addOnsCostEl) addOnsCostEl.textContent = formatMoney(0);
  litterCostEl.textContent = formatMoney(litter);
  if (photoCostEl) photoCostEl.textContent = formatMoney(photos);
  if (medicationCostEl) medicationCostEl.textContent = formatMoney(medication);
  tipCostEl.textContent = formatMoney(tip);
  totalCostEl.textContent = formatMoney(total);
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

// Initialize
calculateTotal();[numDogsInput, numCatsInput, litterBoxesInput, visitCountInput, medicationPetCountInput].filter(Boolean).forEach(input => input.addEventListener('input', calculateTotal));
[tipPercentSelect, medicationNeededSelect].filter(Boolean).forEach(input => input.addEventListener('change', calculateTotal));
serviceRadios.forEach(radio => radio.addEventListener('change', calculateTotal));
if (photoUpdateInput) photoUpdateInput.addEventListener('change', calculateTotal);

if (requestCheckoutBtn) requestCheckoutBtn.addEventListener('click', () => {
  const dogs = Math.max(0, Number(numDogsInput.value) || 0);
  const cats = Math.max(0, Number(numCatsInput.value) || 0);
  const visits = Math.max(1, Number(visitCountInput.value) || 1);
  const service = getSelectedService() === 45 ? '30-minute drop-in ($45 each)' : '60-minute drop-in ($80 each)';
  const details = [
    "Violet's Pet Care - Square Checkout Request",
    "Service: " + service,
    "Number of visits: " + visits,
    "Dogs: " + dogs,
    "Cats: " + cats,
    "Photo updates: " + (photoUpdateInput.checked ? "Yes; " + (dogs + cats) + " pets at $5 per pet per visit" : "No"),
    "Medication: " + (medicationNeededSelect.value === "yes" ? "Yes; " + medicationPetCountInput.value + " pets at $10 per pet per visit" : "No"),
    "Litter boxes: " + litterBoxesInput.value + " at $15 each per visit",
    "Dog discount: " + dogDiscountEl.textContent,
    "Cat discount: " + catDiscountEl.textContent,
    "Optional tip: " + tipCostEl.textContent,
    "Quoted total: " + totalCostEl.textContent,
    "",
    "Please send a Square payment link for exactly " + totalCostEl.textContent + "."
  ].join("\n");
  const subject = encodeURIComponent("Square Checkout Request - " + totalCostEl.textContent);
  window.location.href = "mailto:violetspetcare@yahoo.com?subject=" + subject + "&body=" + encodeURIComponent(details);
});Calculator Variables
const numDogsInput=document.getElementById('numDogs');
const numCatsInput=document.getElementById('numCats');
const litterBoxesInput=document.getElementById('litterBoxes');
const tipPercentSelect=document.getElementById('tipPercent');
const serviceRadios = document.querySelectorAll('input[name="service"]');

const visitCountInput = document.getElementById('visitCount');
const photoUpdateInput = document.getElementById('photoUpdate');
const medicationNeededSelect = document.getElementById('medicationNeeded');
const medicationPetCountInput = document.getElementById('medicationPetCount');
const photoPetCountGroup = document.getElementById('photoPetCountGroup');
const medicationPetCountGroup = document.getElementById('medicationPetCountGroup');
const photoCostEl = document.getElementById('photoCost');
const medicationCostEl = document.getElementById('medicationCost');

const serviceCostEl = document.getElementById('serviceCost');
const petFeesEl = document.getElementById('petFees');
const requestCheckoutBtn = document.getElementById('requestCheckout');
const dogDiscountEl=document.getElementById('dogDiscount');
const catDiscountEl=document.getElementById('catDiscount');
const litterCostEl=document.getElementById('litterCost');
const tipCostEl=document.getElementById('tipCost');
const packageDiscountEl = document.getElementById('packageDiscount');
const addOnsCostEl = document.getElementById('addOnsCost');
const totalCostEl = document.getElementById('totalCost');

const saveQuoteBtn = document.getElementById('saveQuote');
const copyQuoteBtn = document.getElementById('copyQuote');
const stripeCheckoutBtn = document.getElementById('stripeCheckoutBtn');

// Modal
const calculatorModal = document.getElementById('calculatorModal');
const stripeModal = document.getElementById('stripeModal');
const modalClose = document.querySelector('.modal-close');
const btnServices = document.querySelectorAll('.btn-service');
const navCalculator = document.querySelector('.nav-calculator');

// Data
let stops = [];


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
  const dogs = Math.max(0, Number(numDogsInput.value) || 0);
  const cats = Math.max(0, Number(numCatsInput.value) || 0);
  const visits = Math.max(1, Number(visitCountInput.value) || 1);
  const litterBoxes = Math.max(0, Number(litterBoxesInput.value) || 0);
  const tipRate = Number(tipPercentSelect.value) || 0;
  const photoPets = photoUpdateInput.checked ? dogs + cats : 0;
  const medicationPets = medicationNeededSelect.value === 'yes' ? Math.max(1, Number(medicationPetCountInput.value) || 1) : 0;
  const base = servicePrice * visits;
  const extraDogs = Math.max(0, dogs - 1);
  const extraCats = Math.max(0, cats - (dogs > 0 ? 0 : 1));
  const petFees = (extraDogs * 10 + extraCats * 5) * visits;
  const dogDiscount = dogs >= 3 ? base * 0.05 : 0;
  const catDiscount = cats >= 3 ? base * 0.03 : 0;
  const litter = litterBoxes * 15 * visits;
  const photos = photoPets * 5 * visits;
  const medication = medicationPets * 10 * visits;
  const beforeTip = Math.max(0, base + petFees - dogDiscount - catDiscount + litter + photos + medication);
  const tip = beforeTip * tipRate;
  const total = beforeTip + tip;
  if (photoPetCountGroup) photoPetCountGroup.classList.toggle('hidden', !photoUpdateInput.checked);
  if (medicationPetCountGroup) medicationPetCountGroup.classList.toggle('hidden', medicationNeededSelect.value !== 'yes');
  serviceCostEl.textContent = formatMoney(base);
  if (petFeesEl) petFeesEl.textContent = formatMoney(petFees);
  dogDiscountEl.textContent = formatMoney(-dogDiscount);
  catDiscountEl.textContent = formatMoney(-catDiscount);
  if (packageDiscountEl) packageDiscountEl.textContent = formatMoney(0);
  if (addOnsCostEl) addOnsCostEl.textContent = formatMoney(0);
  litterCostEl.textContent = formatMoney(litter);
  if (photoCostEl) photoCostEl.textContent = formatMoney(photos);
  if (medicationCostEl) medicationCostEl.textContent = formatMoney(medication);
  tipCostEl.textContent = formatMoney(tip);
  totalCostEl.textContent = formatMoney(total);
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

// Initialize
calculateTotal();[numDogsInput, numCatsInput, litterBoxesInput, visitCountInput, medicationPetCountInput].filter(Boolean).forEach(input => input.addEventListener('input', calculateTotal));
[tipPercentSelect, medicationNeededSelect].filter(Boolean).forEach(input => input.addEventListener('change', calculateTotal));
serviceRadios.forEach(radio => radio.addEventListener('change', calculateTotal));
if (photoUpdateInput) photoUpdateInput.addEventListener('change', calculateTotal);


