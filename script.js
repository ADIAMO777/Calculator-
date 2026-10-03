const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const keypad = document.getElementById("keypad");

let displayValue = "0";
let firstOperand = null;
let operator = null;
let waitingForOperand = false;
let lastOperator = null;
let lastOperand = null;

function render() {
	display.textContent = displayValue;
	if (operator && firstOperand !== null) {
		expressionDisplay.textContent = `${formatNumber(firstOperand)} ${operatorSymbol(operator)}`;
	} else if (lastOperator && lastOperand !== null) {
		expressionDisplay.textContent = `${formatNumber(lastOperand)} ${operatorSymbol(lastOperator)} =`;
	} else {
		expressionDisplay.textContent = "Ready";
	}
}

function formatNumber(value) {
	if (!Number.isFinite(value)) return "Error";
	return String(Number(value.toPrecision(12)));
}

function operatorSymbol(value) {
	return { "/": "÷", "*": "×", "-": "−", "+": "+" }[value];
}

function inputDigit(digit) {
	if (displayValue === "Error" || waitingForOperand) {
		displayValue = digit;
		waitingForOperand = false;
		if (!operator) {
			lastOperator = null;
			lastOperand = null;
		}
	} else {
		displayValue = displayValue === "0" ? digit : displayValue + digit;
	}
	render();
}

function inputDecimal() {
	if (displayValue === "Error" || waitingForOperand) {
		displayValue = "0.";
		waitingForOperand = false;
		if (!operator) {
			lastOperator = null;
			lastOperand = null;
		}
	} else if (!displayValue.includes(".")) {
		displayValue += ".";
	}
	render();
}

function chooseOperator(nextOperator) {
	const inputValue = Number(displayValue);
	if (!Number.isFinite(inputValue)) return;

	if (operator && !waitingForOperand) {
		const result = performCalculation(firstOperand, inputValue, operator);
		if (!Number.isFinite(result)) {
			showError();
			return;
		}
		displayValue = formatNumber(result);
		firstOperand = result;
	} else {
		firstOperand = inputValue;
	}

	operator = nextOperator;
	waitingForOperand = true;
	lastOperator = null;
	lastOperand = null;
	render();
}

function calculate() {
	if (displayValue === "Error") return;

	if (operator && firstOperand !== null) {
		const secondOperand = Number(displayValue);
		const result = performCalculation(firstOperand, secondOperand, operator);
		if (!Number.isFinite(result)) {
			showError();
			return;
		}
		lastOperator = operator;
		lastOperand = secondOperand;
		displayValue = formatNumber(result);
		operator = null;
		firstOperand = null;
		waitingForOperand = true;
		render();
		return;
	}

	if (lastOperator && lastOperand !== null) {
		const result = performCalculation(Number(displayValue), lastOperand, lastOperator);
		if (!Number.isFinite(result)) {
			showError();
			return;
		}
		displayValue = formatNumber(result);
		render();
	}
}

function performCalculation(left, right, operation) {
	switch (operation) {
		case "+": return left + right;
		case "-": return left - right;
		case "*": return left * right;
		case "/": return right === 0 ? NaN : left / right;
		default: return right;
	}
}

function applyPercent() {
	const value = Number(displayValue);
	if (!Number.isFinite(value)) return;
	if (operator && firstOperand !== null && (operator === "+" || operator === "-")) {
		displayValue = formatNumber((firstOperand * value) / 100);
	} else {
		displayValue = formatNumber(value / 100);
	}
	waitingForOperand = false;
	render();
}

function toggleSign() {
	if (displayValue === "0" || displayValue === "Error") return;
	displayValue = displayValue.startsWith("-") ? displayValue.slice(1) : `-${displayValue}`;
	render();
}

function clear() {
	displayValue = "0";
	firstOperand = null;
	operator = null;
	waitingForOperand = false;
	lastOperator = null;
	lastOperand = null;
	render();
}

function deleteLastDigit() {
	if (displayValue === "Error") return;
	if (waitingForOperand) {
		if (operator) return;
		waitingForOperand = false;
		lastOperator = null;
		lastOperand = null;
	}
	displayValue = displayValue.length > 1 ? displayValue.slice(0, -1) : "0";
	if (displayValue === "-") displayValue = "0";
	render();
}

function showError() {
	displayValue = "Error";
	firstOperand = null;
	operator = null;
	waitingForOperand = true;
	lastOperator = null;
	lastOperand = null;
	render();
}

function handleAction(action) {
	if (action === "clear") clear();
	else if (action === "delete") deleteLastDigit();
	else if (action === "calculate") calculate();
	else if (action === "percent") applyPercent();
	else if (action === "sign") toggleSign();
}

keypad.addEventListener("click", (event) => {
	const button = event.target.closest("button");
	if (!button) return;
	if (button.dataset.action) handleAction(button.dataset.action);
	else if (/^\d$/.test(button.dataset.value)) inputDigit(button.dataset.value);
	else if (button.dataset.value === ".") inputDecimal();
	else chooseOperator(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
	if (/^\d$/.test(event.key)) inputDigit(event.key);
	else if (event.key === ".") inputDecimal();
	else if (["+", "-", "*", "/"].includes(event.key)) chooseOperator(event.key);
	else if (event.key === "%") applyPercent();
	else if (event.key === "Enter" || event.key === "=") {
		event.preventDefault();
		calculate();
	} else if (event.key === "Backspace") {
		event.preventDefault();
		deleteLastDigit();
	} else if (event.key === "Escape") clear();
});

render();
