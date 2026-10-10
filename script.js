const display = document.getElementById('display');
let currentInput = '0';
let expression = '';

function updateDisplay(value) {
  display.textContent = value;
}

function appendValue(value) {
  if (value === '.' && currentInput.includes('.')) return;

  if (currentInput === '0' && value !== '.') {
    currentInput = value;
  } else {
    currentInput += value;
  }

  expression = expression + value;
  updateDisplay(currentInput);
}

function handleOperator(operator) {
  if (!expression || /[+\-*/]$/.test(expression)) {
    if (operator === '-') {
      expression += operator;
      currentInput = '-';
      updateDisplay(currentInput);
    }
    return;
  }

  expression += operator;
  currentInput = '0';
  updateDisplay('0');
}

function clearCalculator() {
  expression = '';
  currentInput = '0';
  updateDisplay('0');
}

function deleteLast() {
  if (!expression) return;

  expression = expression.slice(0, -1);
  currentInput = expression.slice(-1) || '0';

  if (expression === '') {
    currentInput = '0';
  }

  updateDisplay(currentInput === '0' && !expression ? '0' : currentInput);
}

function calculateResult() {
  if (!expression) return;

  try {
    const sanitized = expression.replace(/×/g, '*').replace(/÷/g, '/');
    const result = Function(`"use strict"; return (${sanitized})`)();

    if (!Number.isFinite(result)) {
      throw new Error('Invalid calculation');
    }

    const formatted = Number.isInteger(result) ? String(result) : Number(result.toFixed(10)).toString();
    expression = formatted;
    currentInput = formatted;
    updateDisplay(formatted);
  } catch (error) {
    updateDisplay('Error');
    expression = '';
    currentInput = '0';
  }
}

document.querySelectorAll('[data-value]').forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.value;

    if (/[0-9.]/.test(value)) {
      appendValue(value);
      return;
    }

    handleOperator(value);
  });
});

document.querySelector('[data-action="clear"]').addEventListener('click', clearCalculator);
document.querySelector('[data-action="delete"]').addEventListener('click', deleteLast);
document.querySelector('[data-action="calculate"]').addEventListener('click', calculateResult);

updateDisplay('0');
