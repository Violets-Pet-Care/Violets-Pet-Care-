// Violet's Pet Care quote calculator
const numDogsInput = document.getElementById('numDogs');
const numCatsInput = document.getElementById('numCats');
const litterBoxesInput = document.getElementById('litterBoxes');
const tipPercentSelect = document.getElementById('tipPercent');
const serviceRadios = document.querySelectorAll('input[name="service"]');
const visitCountInput = document.getElementById('visitCount');
const photoUpdateInput = document.getElementById('photoUpdate');
const medicationNeededSelect = document.getElementById('medicationNeeded');
const medicationPetCountInput = document.getElementById('medicationPetCount');
const medicationPetCountGroup = document.getElementById('medicationPetCountGroup');

const serviceCostEl = document.getElementById('serviceCost');
const petFeesEl = document.getElementById('petFees');
const dogDiscountEl = document.getElementById('dogDiscount');
const catDiscountEl = document.getElementById('catDiscount');
const litterCostEl = document.getElementById('litterCost');
const photoCostEl = document.getElementById('photoCost');
const medicationCostEl = document.getElementById('medicationCost');
const tipCostEl = document.getElementById('tipCost');
const totalCostEl = document.getElementById('totalCost');
const requestCheckoutBtn = document.getElementById('requestCheckout');
const saveQuoteBtn = document.getElementById('saveQuote');
const copyQuoteBtn = document.getElementById('copyQuote');
const stripeCheckoutBtn = document.getElementById('stripeCheckoutBtn');
const calculatorModal = document.getElementById('calculatorModal');
const stripeModal = document.getElementById('stripeModal');
const btnServices = document.querySelectorAll('.btn-service');
const navCalculator = document.querySelector('.nav-calculator');

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}
function getSelectedService() {
  const selected = document.querySelector('input[name="service"]:checked');
  return selected ? Number(selected.value) : 45;
}
function calculateTotal() {
  const dogs = Math.max(0, Number(numDogsInput.value) || 0);
  const cats = Math.max(0, Number(numCatsInput.value) || 0);
  const visits = Math.max(1, Number(visitCountInput.value) || 1);
  const boxes = Math.max(0, Number(litterBoxesInput.value) || 0);
  const tipRate = Number(tipPercentSelect.value) || 0;
  const photoPets = photoUpdateInput.checked ? dogs + cats : 0;
  const medicationPets = medicationNeededSelect.value === 'yes' ? Math.max(1, Number(medicationPetCountInput.value) || 1) : 0;
  const base = getSelectedService() * visits;
  const additionalPets = Math.max(0, dogs + cats - 1);
  const petFees = additionalPets * 5 * visits;
  const dogDiscount = dogs >= 3 ? base * 0.05 : 0;
  const catDiscount = cats >= 3 ? base * 0.03 : 0;
  const litter = boxes * 15 * visits;
  const photos = photoPets * 5 * visits;
  const medication = medicationPets * 10 * visits;
  const beforeTip = Math.max(0, base + petFees - dogDiscount - catDiscount + litter + photos + medication);
  const tip = beforeTip * tipRate;
  const total = beforeTip + tip;

  if (medicationPetCountGroup) medicationPetCountGroup.classList.toggle('hidden', medicationNeededSelect.value !== 'yes');
  serviceCostEl.textContent = formatMoney(base);
  petFeesEl.textContent = formatMoney(petFees);
  dogDiscountEl.textContent = formatMoney(-dogDiscount);
  catDiscountEl.textContent = formatMoney(-catDiscount);
  litterCostEl.textContent = formatMoney(litter);
  photoCostEl.textContent = formatMoney(photos);
  medicationCostEl.textContent = formatMoney(medication);
  tipCostEl.textContent = formatMoney(tip);
  totalCostEl.textContent = formatMoney(total);
  return { dogs, cats, visits, boxes, photoPets, medicationPets, base, petFees, dogDiscount, catDiscount, litter, photos, medication, tip, total };
}

function buildQuoteText(q) {
  const service = getSelectedService() === 45 ? '30-minute drop-in ($45 each)' : '60-minute drop-in ($80 each)';
  return [
    "Violet's Pet Care Quote",
    'Service: ' + service,
    'Visits: ' + q.visits,
    'Dogs: ' + q.dogs,
    'Cats: ' + q.cats,
    'Additional pet fees: ' + formatMoney(q.petFees),
    'Photo updates: ' + (photoUpdateInput.checked ? q.photoPets + ' pets at $5 per pet per visit (' + formatMoney(q.photos) + ')' : 'No'),
    'Medication: ' + (medicationNeededSelect.value === 'yes' ? q.medicationPets + ' pets at $10 per pet per visit (' + formatMoney(q.medication) + ')' : 'No'),
    'Litter boxes: ' + q.boxes + ' at $15 per box per visit (' + formatMoney(q.litter) + ')',
    'Dog discount: ' + formatMoney(-q.dogDiscount),
    'Cat discount: ' + formatMoney(-q.catDiscount),
    'Tip: ' + formatMoney(q.tip),
    'TOTAL: ' + formatMoney(q.total)
  ].join('\n');
}

[numDogsInput, numCatsInput, litterBoxesInput, visitCountInput, medicationPetCountInput].forEach(input => input.addEventListener('input', calculateTotal));
[tipPercentSelect, medicationNeededSelect].forEach(input => input.addEventListener('change', calculateTotal));
serviceRadios.forEach(radio => radio.addEventListener('change', calculateTotal));
photoUpdateInput.addEventListener('change', calculateTotal);

if (saveQuoteBtn) saveQuoteBtn.addEventListener('click', () => {
  const q = calculateTotal();
  localStorage.setItem('lastQuote', JSON.stringify({ quote: buildQuoteText(q), timestamp: new Date().toLocaleString() }));
  alert('Quote saved in this browser.');
});
if (copyQuoteBtn) copyQuoteBtn.addEventListener('click', () => {
  const q = calculateTotal();
  navigator.clipboard.writeText(buildQuoteText(q)).then(() => alert('Quote copied.'));
});
if (requestCheckoutBtn) requestCheckoutBtn.addEventListener('click', () => {
  const q = calculateTotal();
  const details = buildQuoteText(q) + '\n\nPlease send me a Square payment link for exactly ' + formatMoney(q.total) + '.';
  window.location.href = 'mailto:violetspetcare@yahoo.com?subject=' + encodeURIComponent('Square Checkout Request - ' + formatMoney(q.total)) + '&body=' + encodeURIComponent(details);
});

function openCalculator() {
  calculatorModal.classList.add('show');
  calculateTotal();
}
function closeCalculator() { calculatorModal.classList.remove('show'); }
function openStripeModal() { stripeModal.classList.add('show'); }
function closeStripeModal() { stripeModal.classList.remove('show'); }
document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', e => {
  if (e.target.closest('#calculatorModal')) closeCalculator();
  if (e.target.closest('#stripeModal')) closeStripeModal();
}));
window.addEventListener('click', e => {
  if (e.target === calculatorModal) closeCalculator();
  if (e.target === stripeModal) closeStripeModal();
});
btnServices.forEach(btn => btn.addEventListener('click', openCalculator));
if (navCalculator) navCalculator.addEventListener('click', e => { e.preventDefault(); openCalculator(); });
if (stripeCheckoutBtn) stripeCheckoutBtn.addEventListener('click', () => {
  closeStripeModal();
  openCalculator();
});
calculateTotal();
