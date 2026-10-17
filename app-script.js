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
const squareQuoteBtn = document.getElementById('squareQuoteBtn');
const calculatorModal = document.getElementById('calculatorModal');

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
  // The base visit includes one pet total. Charge the species-specific rate for each pet after that first pet.
  const includedDog = dogs > 0 ? 1 : 0;
  const includedCat = includedDog === 0 && cats > 0 ? 1 : 0;
  const additionalDogs = Math.max(0, dogs - includedDog);
  const additionalCats = Math.max(0, cats - includedCat);
  const petFees = (additionalDogs * 10 + additionalCats * 5) * visits;
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
    'Additional dog fees: ' + formatMoney(Math.max(0, q.dogs - (q.dogs > 0 ? 1 : 0)) * 10 * q.visits),
    'Additional cat fees: ' + formatMoney(Math.max(0, q.cats - (q.dogs > 0 ? 0 : (q.cats > 0 ? 1 : 0))) * 5 * q.visits),
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
function createSquareCheckout(q) {
  const panel = document.getElementById('squareCheckoutOptions');
  const error = document.getElementById('checkoutError');
  if (!panel || !requestCheckoutBtn) return;
  if (error) { error.classList.add('hidden'); error.textContent = ''; }
  panel.classList.remove('hidden');
  panel.innerHTML =
    '<h3>Pay with Square</h3>' +
    '<p>Your estimated quote is <strong>' + formatMoney(q.total) + '</strong>. These Square links charge their preset amounts and do not automatically include all quote extras or multiple visits. Please confirm the final amount with Violet before paying.</p>' +
    '<a class="square-pay-option" href="https://square.link/u/ldikVBKy" target="_blank" rel="noopener noreferrer"><span><strong>30-Minute Drop-In</strong><small>Square payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://square.link/u/HLLmiCnS" target="_blank" rel="noopener noreferrer"><span><strong>60-Minute Drop-In</strong><small>Square payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://square.link/u/A9UN0EOD" target="_blank" rel="noopener noreferrer"><span><strong>Additional Dog</strong><small>Square add-on payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://square.link/u/3tbEasUn" target="_blank" rel="noopener noreferrer"><span><strong>Additional Cat</strong><small>Square add-on payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://square.link/u/zGAtKBOu" target="_blank" rel="noopener noreferrer"><span><strong>Litter Box Cleaning</strong><small>Square add-on payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://square.link/u/8ZiTmEZr" target="_blank" rel="noopener noreferrer"><span><strong>Medication Administration</strong><small>Square add-on payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://square.link/u/YMzJncy4" target="_blank" rel="noopener noreferrer"><span><strong>Additional Pictures</strong><small>Square add-on payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://square.link/u/1e4jo5bK" target="_blank" rel="noopener noreferrer"><span><strong>Meet &amp; Greet</strong><small>Square payment link</small></span><span aria-hidden="true">↗</span></a>' +
    '<a class="square-pay-option" href="https://app.squareup.com/appointments/book/qh0xuxt3vxzjxz/LAQGSCJHZ6BSX/start" target="_blank" rel="noopener noreferrer"><span><strong>Book or Arrange a Visit</strong><small>Open Square appointments</small></span><span aria-hidden="true">↗</span></a>';
  requestCheckoutBtn.disabled = false;
  requestCheckoutBtn.textContent = 'Continue with Square →';
}
if (requestCheckoutBtn) requestCheckoutBtn.addEventListener('click', () => {
  createSquareCheckout(calculateTotal());
});

function openCalculator() {
  calculatorModal.classList.add('show');
  calculateTotal();
  if (typeof showQuoteStep === 'function') showQuoteStep(1);
}
function closeCalculator() { calculatorModal.classList.remove('show'); }
document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', e => {
  if (e.target.closest('#calculatorModal')) closeCalculator();
}));
window.addEventListener('click', e => {
  if (e.target === calculatorModal) closeCalculator();
});
btnServices.forEach(btn => btn.addEventListener('click', openCalculator));
if (navCalculator) navCalculator.addEventListener('click', e => { e.preventDefault(); openCalculator(); });
if (squareQuoteBtn) squareQuoteBtn.addEventListener('click', openCalculator);
calculateTotal();

let currentQuoteStep = 1;
function showQuoteStep(step) {
  currentQuoteStep = Math.max(1, Math.min(3, Number(step) || 1));
  document.querySelectorAll('#calculatorModal [data-quote-step]').forEach(panel => {
    panel.classList.toggle('is-active', Number(panel.dataset.quoteStep) === currentQuoteStep);
  });
  document.querySelectorAll('#calculatorModal [data-step-indicator]').forEach(indicator => {
    const n = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle('is-active', n === currentQuoteStep);
    indicator.classList.toggle('is-complete', n < currentQuoteStep);
  });
  if (currentQuoteStep === 3) calculateTotal();
  const content = document.querySelector('#calculatorModal .modal-content');
  if (content) content.scrollTop = 0;
}
document.querySelectorAll('#calculatorModal [data-next-step]').forEach(button => button.addEventListener('click', () => showQuoteStep(button.dataset.nextStep)));
document.querySelectorAll('#calculatorModal [data-prev-step]').forEach(button => button.addEventListener('click', () => showQuoteStep(button.dataset.prevStep)));

if (new URLSearchParams(window.location.search).get('quote') === '1') {
  openCalculator();
}
