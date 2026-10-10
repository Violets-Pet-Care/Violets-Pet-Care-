const serviceSelect = document.getElementById('service');
const visitsInput = document.getElementById('visits');
const photoUpdate = document.getElementById('photoUpdate');
const holidayVisit = document.getElementById('holidayVisit');
const visitTotalEl = document.getElementById('visitTotal');
const addonTotalEl = document.getElementById('addonTotal');
const grandTotalEl = document.getElementById('grandTotal');
const calculateBtn = document.getElementById('calculateBtn');

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function calculateTotal() {
  const servicePrice = Number(serviceSelect.value);
  const visitCount = Math.max(1, Number(visitsInput.value) || 1);

  const photoFee = photoUpdate.checked ? 5 * visitCount : 0;
  const holidayFee = holidayVisit.checked ? 15 * visitCount : 0;

  const baseTotal = servicePrice * visitCount;
  const addOnTotal = photoFee + holidayFee;
  const grandTotal = baseTotal + addOnTotal;

  visitTotalEl.textContent = formatMoney(baseTotal);
  addonTotalEl.textContent = formatMoney(addOnTotal);
  grandTotalEl.textContent = formatMoney(grandTotal);
}

serviceSelect.addEventListener('change', calculateTotal);
visitsInput.addEventListener('input', calculateTotal);
photoUpdate.addEventListener('change', calculateTotal);
holidayVisit.addEventListener('change', calculateTotal);
calculateBtn.addEventListener('click', calculateTotal);

calculateTotal();
