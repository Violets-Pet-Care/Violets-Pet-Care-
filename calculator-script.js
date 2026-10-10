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
const monthlyNoteEl = document.getElementById('monthlyNote');

const saveQuoteBtn = document.getElementById('saveQuote');
const copyQuoteBtn = document.getElementById('copyQuote');

let currentPlan = 'one-time';

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

  monthlyNoteEl.classList.remove('show');
  if (currentPlan === 'monthly') {
    monthlyNoteEl.classList.add('show');
    monthlyNoteEl.innerHTML = `<strong>Monthly Plan:</strong> ${visitCount} visits per month = ${formatMoney(grandTotal)}/month. First month may vary based on start date.`;
  }
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
  showSuccessMessage('Quote saved! You can view it later.');
});

copyQuoteBtn.addEventListener('click', () => {
  const quoteText = `Violet's Pet Care Quote\n\nService Cost: ${serviceCostEl.textContent}\nPet Discount: ${petDiscountEl.textContent}\nPackage Discount: ${packageDiscountEl.textContent}\nAdd-Ons: ${addOnsCostEl.textContent}\n\nEstimated Total: ${totalCostEl.textContent}\n\nGenerated: ${new Date().toLocaleString()}`;

  navigator.clipboard.writeText(quoteText)
    .then(() => {
      showSuccessMessage('Quote copied to clipboard!');
    })
    .catch(() => {
      alert('Failed to copy quote');
    });
});

function showSuccessMessage(message) {
  let successMsg = document.querySelector('.success-message');
  if (!successMsg) {
    successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    const summarySection = document.querySelector('.summary-section');
    summarySection.insertBefore(successMsg, summarySection.firstChild);
  }

  successMsg.textContent = message;
  successMsg.classList.add('show');

  setTimeout(() => {
    successMsg.classList.remove('show');
  }, 3000);
}

calculateTotal();
