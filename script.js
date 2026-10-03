const display = document.getElementById("display");

function appendToDisplay(value) {
	display.value += value;
}

function clearDisplay() {
	display.value = "";
}

function calculateResult() {
	const expression = display.value;

	if (!expression || !/^[\d.+*/ -]+$/.test(expression)) {
		display.value = "Error";
		return;
	}

	try {
		const result = evaluateExpression(expression);
		display.value = Number.isFinite(result) ? String(result) : "Error";
	} catch {
		display.value = "Error";
	}
}

function evaluateExpression(expression) {
	const tokens = expression.match(/\d*\.?\d+|[+*/-]/g);

	if (!tokens || tokens.join("") !== expression.replace(/\s/g, "")) {
		throw new Error("Invalid expression");
	}

	const values = [];
	const operators = [];
	let expectsNumber = true;

	for (const token of tokens) {
		if (/^\d/.test(token) || /^\.\d/.test(token)) {
			if (!expectsNumber) throw new Error("Missing operator");
			values.push(Number(token));
			expectsNumber = false;
			continue;
		}

		if (expectsNumber) {
			if (token !== "-") throw new Error("Missing number");
			operators.push("u-");
			continue;
		}

		while (
			operators.length &&
			precedence(operators[operators.length - 1]) >= precedence(token)
		) {
			applyOperator(values, operators.pop());
		}
		operators.push(token);
		expectsNumber = true;
	}

	if (expectsNumber) throw new Error("Incomplete expression");

	while (operators.length) applyOperator(values, operators.pop());
	return values[0];
}

function precedence(operator) {
	if (operator === "u-") return 3;
	return operator === "*" || operator === "/" ? 2 : 1;
}

function applyOperator(values, operator) {
	if (operator === "u-") {
		const value = values.pop();
		if (value === undefined) throw new Error("Invalid expression");
		values.push(-value);
		return;
	}

	const right = values.pop();
	const left = values.pop();

	if (left === undefined || right === undefined) {
		throw new Error("Invalid expression");
	}

	switch (operator) {
		case "+":
			values.push(left + right);
			break;
		case "-":
			values.push(left - right);
			break;
		case "*":
			values.push(left * right);
			break;
		case "/":
			values.push(left / right);
			break;
		default:
			throw new Error("Unknown operator");
	}
}
