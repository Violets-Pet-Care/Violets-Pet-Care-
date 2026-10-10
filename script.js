const display = document.getElementById("display");
const buttons = document.querySelectorAll(".btn");

let expression = "";

function updateDisplay() {
  display.textContent = expression || "0";
}

function appendValue(value) {
  const lastChar = expression.slice(-1);

  if (["+", "-", "*", "/"].includes(value)) {
    if (!expression || ["+", "-", "*", "/"].includes(lastChar)) {
      return;
    }
    expression += value;
  } else if (value === ".") {
    const parts = expression.split(/[+\-*/]/);
    const currentPart = parts[parts.length - 1];
    if (currentPart.includes(".")) return;
    expression += value;
  } else {
    expression += value;
  }

  updateDisplay();
}

function clearDisplay() {
  expression = "";
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
}

function calculate() {
  if (!expression) return;

  try {
    const result = Function(`"use strict"; return (${expression})`)();
    expression = Number.isInteger(result) ? String(result) : String(parseFloat(result.toFixed(10)));
    updateDisplay();
  } catch {
    expression = "";
    display.textContent = "Error";
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
      clearDisplay();
    } else if (action === "delete") {
      deleteLast();
    } else if (action === "calculate") {
      calculate();
    } else if (value) {
      appendValue(value);
    }
  });
});
