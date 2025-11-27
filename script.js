// Working on getting expression result display elements
const exprEl = document.getElementById("expr");
const resultEl = document.getElementById("result");
const keys = document.querySelectorAll(".key");
// Variables to store calculator data
let expr = "";
let displayExpr = "";
let afterEquals = false;
// Safe evaluation of mathematical expressions
function safeEval(expression) {
  // Allowing only safe characters
  if (!/^[0-9+\-*/().%]*$/.test(expression)) {
    return NaN;
  }
  try {
    return new Function("return " + expression)();
  } catch {
    return NaN;
  }
}
// To update the expression display
function updateDisplay() {
  exprEl.textContent = displayExpr || "0";
  // Auto-scroll long expressions
  exprEl.scrollLeft = exprEl.scrollWidth;
}
// To update the result display
function updateResult() {
  if (!expr) {
    resultEl.textContent = "0";
    return;
  }
  const val = safeEval(expr);
  // Displaying result nicely, round long decimals
  resultEl.textContent = isFinite(val) ? String(Number(val.toPrecision(12))).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1") : "Error";
  // Flash animation
  resultEl.classList.remove("flash");
  void resultEl.offsetWidth;
  resultEl.classList.add("flash");
}
// Handling number input (0-9 and decimal)
function inputNumber(num) {
  // If user presses "."
  if (num === ".") {
    // Find last operator in the string
    let lastOp = Math.max(expr.lastIndexOf("+"), expr.lastIndexOf("-"), expr.lastIndexOf("*"), expr.lastIndexOf("/"));
    // Getting the current number segment
    let segment = expr.slice(lastOp + 1);
    // Preventing multiple decimals like "5.3.2"
    if (segment.includes(".")) return;
    // If user starts with ".", we add "0."
    if (segment === "") {
      expr += "0.";
      displayExpr += "0.";
    } else {
      expr += ".";
      displayExpr += ".";
    }
    return;
  }
  // Normal digit input
  expr += num;
  displayExpr += num;
}

// Handling operator input (+, -, *, /)

function inputOperator(op) {
  // If last action was equals
  if (afterEquals) {
    afterEquals = false; // resetting the flag
    expr = displayExpr; // keeping the result as starting point
    displayExpr = displayExpr + op;
    expr = expr + op;
    return;
  }
  // If nothing is typed yet, we will allow starting with "-" (unary minus)
  if (!expr) {
    if (op === "-") {
      expr = "-";
      displayExpr = "-";
    }
    return;
  }

  // If expression already ends with an operator, let us replace it
  if (/[+\-*/]$/.test(expr)) {
    expr = expr.slice(0, -1) + op;
    displayExpr = displayExpr.slice(0, -1) + op;
  }
  else {
    // Normal operator input
    expr += op;
    displayExpr += op;
  }
}

// Clearing entire expression
function clearAll() {
  expr = "";
  displayExpr = "";
  updateDisplay();
  updateResult();
}

// Backspace (deleting last character)
function backspace() {
  expr = expr.slice(0, -1);
  displayExpr = displayExpr.slice(0, -1);
  updateDisplay();
  updateResult();
}

// Percent button - convert last number to percentage
function applyPercent() {
  // Finding last number segment
  const match = expr.match(/([0-9.]+)$/);
  if (!match) return;

  const number = match[1];
  const converted = `(${number}/100)`;
  expr = expr.replace(/([0-9.]+)$/, converted);
  displayExpr = displayExpr.replace(/([0-9.]+)$/, number + "%");
  updateDisplay();
  updateResult();
}
// Evaluating the final expression when "=" is pressed
function evaluateExpression() {
  // This prevents evaluation if already showing a final result without new input
  if (/^[0-9.]+$/.test(expr)) return;
  if (!expr) return;
  const val = safeEval(expr);
  if (!isFinite(val)) {
    resultEl.textContent = "Error";
    return;
  }
  // Cleaning result like 5.0000 -> 5 or 5.1200 -> 5.12
  const cleaned = String(Number(val.toPrecision(12))).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");
  expr = cleaned; // To contine calculation after result
  displayExpr = cleaned; // To update visible expression
  updateDisplay();
  updateResult();
  afterEquals = true;
}
// Button Handling
keys.forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const num = btn.dataset.num;
    const op = btn.dataset.value;
    if (num !== undefined) {
      inputNumber(num);
    }
    else if (action === "op") {
      inputOperator(op);
    }
    else if (action === "clear") {
      clearAll();
    }
    else if (action === "backspace") {
      backspace();
    }
    else if (action === "percent") {
      applyPercent();
    }
    else if (action === "equals") {
      evaluateExpression();
      return; // To stop further updating
    }
    updateDisplay();
    updateResult();
  });
});
// ====Keyboard support ====
document.addEventListener("keydown", (e) => {
  const key = e.key;
  // Numbers
  if (!isNaN(key)) {
    inputNumber(key);
    updateDisplay();
    updateResult();
    return;
  }
  // Decimal
  if (key === ".") {
    inputNumber(".");
    updateDisplay();
    updateResult();
    return;
  }
  // Operators
  if (["+", "-", "*", "/"].includes(key)) {
    inputOperator(key);
    updateDisplay();
    updateResult();
    return;
  }
  // Equals (Enter or =)
  if (key === "Enter" || key === "=") {
    return evaluateExpression();
    
  }
  // Backspace
  if (key === "Backspace") {
    return backspace();
    
  }
  // Clear (Escape)
  if (key === "Escape") {
    return clearAll();   
  }
});