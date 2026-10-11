const numDogsInput=document.getElementById('numDogs');
const numCatsInput=document.getElementById('numCats');
const litterBoxesInput=document.getElementById('litterBoxes');
const tipPercentSelect=document.getElementById('tipPercent');
const serviceRadios = document.querySelectorAll('input[name="service"]');
const planTabs = document.querySelectorAll('.plan-tab');
const planInputs = document.querySelectorAll('.plan-input');
const visitCountInput = document.getElementById('visitCount');
const packageSizeSelect = document.getElementById('packageSize');
const monthlyVisitsSelect = document.getElementById('monthlyVisits');
const addonCheckboxes = document.querySelectorAll('.checkbox-label input[type="checkbox"]');

const serviceCostEl = document.getElementById('serviceCost');
const dogDiscountEl=document.getElementById('dogDiscount');
const catDiscountEl=document.getElementById('catDiscount');
const litterCostEl=document.getElementById('litterCost');
const tipCostEl=document.getElementById('tipCost');
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
  const servicePrice=getSelectedService(), dogs=Math.max(0,Number(numDogsInput.value)||0), cats=Math.max(0,Number(numCatsInput.value)||0);
  const litterBoxes=Math.max(0,Number(litterBoxesInput.value)||0), tipRate=Number(tipPercentSelect.value)||0;
  let visitCount=1, packageRate=0, addonCost=0;
  addonCheckboxes.forEach(c=>{if(c.checked)addonCost+=Number(c.dataset.addon);});
  if(currentPlan==='one-time') visitCount=Math.max(1,Number(visitCountInput.value)||1);
  else if(currentPlan==='package'){visitCount=Number(packageSizeSelect.value);packageRate=visitCount>=15?.20:visitCount>=10?.15:.10;}
  else if(currentPlan==='monthly'){visitCount=Number(monthlyVisitsSelect.value);packageRate=.15;}
  const base=servicePrice*visitCount, dogDiscount=dogs>=3?base*.05:0, catDiscount=cats>=3?base*.03:0;
  const packageDiscount=(currentPlan==='package'||currentPlan==='monthly')?base*packageRate:0;
  const addons=addonCost*visitCount, litter=litterBoxes*15*visitCount;
  const beforeTip=Math.max(0,base-dogDiscount-catDiscount-packageDiscount+addons+litter), tip=beforeTip*tipRate, total=beforeTip+tip;
  serviceCostEl.textContent=formatMoney(base);dogDiscountEl.textContent=formatMoney(-dogDiscount);catDiscountEl.textContent=formatMoney(-catDiscount);
  packageDiscountEl.textContent=formatMoney(-packageDiscount);addOnsCostEl.textContent=formatMoney(addons);litterCostEl.textContent=formatMoney(litter);
  tipCostEl.textContent=formatMoney(tip);totalCostEl.textContent=formatMoney(total);
  if(typeof monthlyNoteEl!=='undefined'&&monthlyNoteEl){monthlyNoteEl.classList.remove('show');if(currentPlan==='monthly'){monthlyNoteEl.classList.add('show');monthlyNoteEl.innerHTML='<strong>Monthly Plan:</strong> '+visitCount+' visits per month = '+formatMoney(total)+'/month. First month may vary based on start date.';}}
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

[numDogsInput,numCatsInput,litterBoxesInput].forEach(input=>input.addEventListener('input',calculateTotal));
tipPercentSelect.addEventListener('change',calculateTotal);
serviceRadios.forEach((radio) => radio.addEventListener('change', calculateTotal));
visitCountInput.addEventListener('input', calculateTotal);
packageSizeSelect.addEventListener('change', calculateTotal);
monthlyVisitsSelect.addEventListener('change', calculateTotal);
addonCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', calculateTotal));

saveQuoteBtn.addEventListener('click', () => {
  const quote = {
    service: getSelectedService(),
    numDogs:numDogsInput.value,numCats:numCatsInput.value,litterBoxes:litterBoxesInput.value,
    plan: currentPlan,
    total: totalCostEl.textContent,
    timestamp: new Date().toLocaleString()
  };

  localStorage.setItem('lastQuote', JSON.stringify(quote));
  showSuccessMessage('Quote saved! You can view it later.');
});

copyQuoteBtn.addEventListener('click', () => {
  const quoteText = `Violet's Pet Care Quote\nService Cost: ${serviceCostEl.textContent}\nDog Discount: ${dogDiscountEl.textContent}\nCat Discount: ${catDiscountEl.textContent}\nPackage Discount: ${packageDiscountEl.textContent}\nAdd-Ons: ${addOnsCostEl.textContent}\nLitter Box Cleaning: ${litterCostEl.textContent}\nOptional Tip: ${tipCostEl.textContent}\nEstimated Total: ${totalCostEl.textContent}`;

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
