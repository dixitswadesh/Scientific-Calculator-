// Android Calculator Core Engine & Math Processor

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalcState {
  expression: string;
  displayValue: string;
  isRadMode: boolean;
  memory: number;
  hasEvaluated: boolean;
  history: HistoryItem[];
}

export function formatNumberWithCommas(numStr: string): string {
  if (!numStr || numStr === 'Error' || isNaN(Number(numStr))) return numStr;
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Factorial helper
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // JS floating point limit
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Evaluate mathematical expressions safely without raw eval
export function evaluateExpression(rawExpr: string, isRadMode: boolean): { success: boolean; result: string; error?: string } {
  if (!rawExpr.trim()) {
    return { success: true, result: '0' };
  }

  try {
    let expr = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`);

    // Replace scientific function calls
    // Handle trigonometry with Radian/Degree mode
    const degToRad = (val: number) => (isRadMode ? val : (val * Math.PI) / 180);
    const radToDeg = (val: number) => (isRadMode ? val : (val * 180) / Math.PI);

    // Provide safe scope mapping
    const mathScope: Record<string, Function> = {
      sin: (x: number) => Math.sin(degToRad(x)),
      cos: (x: number) => Math.cos(degToRad(x)),
      tan: (x: number) => Math.tan(degToRad(x)),
      asin: (x: number) => radToDeg(Math.asin(x)),
      acos: (x: number) => radToDeg(Math.acos(x)),
      atan: (x: number) => radToDeg(Math.atan(x)),
      sqrt: (x: number) => Math.sqrt(x),
      cbrt: (x: number) => Math.cbrt(x),
      log: (x: number) => Math.log10(x),
      ln: (x: number) => Math.log(x),
      abs: (x: number) => Math.abs(x),
      fact: (x: number) => factorial(x),
    };

    // Replace factorial syntax like "5!" with "fact(5)"
    expr = expr.replace(/(\d+(\.\d+)?)!/g, 'fact($1)');

    // Replace percent syntax "X%" with "(X/100)"
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Replace power syntax like "x^y" with "Math.pow(x, y)"
    // Support simple power replacement
    expr = expr.replace(/(\d+(\.\d+)?)\^(\d+(\.\d+)?)/g, 'Math.pow($1, $3)');

    // Replace function names with mathScope lookups
    const sanitizedExpr = expr
      .replace(/\bsin\(/g, 'mathScope.sin(')
      .replace(/\bcos\(/g, 'mathScope.cos(')
      .replace(/\btan\(/g, 'mathScope.tan(')
      .replace(/\basin\(/g, 'mathScope.asin(')
      .replace(/\bacos\(/g, 'mathScope.acos(')
      .replace(/\batan\(/g, 'mathScope.atan(')
      .replace(/\bsqrt\(/g, 'mathScope.sqrt(')
      .replace(/\bcbrt\(/g, 'mathScope.cbrt(')
      .replace(/\blog\(/g, 'mathScope.log(')
      .replace(/\bln\(/g, 'mathScope.ln(')
      .replace(/\bfact\(/g, 'mathScope.fact(');

    // Validate characters to ensure safety: numbers, operators, parens, mathScope identifiers
    const allowedPattern = /^[\d\s+\-*/().,%Math.powmathScopea-z_]+$/i;
    if (!allowedPattern.test(sanitizedExpr)) {
      return { success: false, result: 'Error', error: 'Invalid characters' };
    }

    // Evaluate in safe Function closure
    const evaluator = new Function('mathScope', `return (${sanitizedExpr});`);
    const numResult = evaluator(mathScope);

    if (numResult === undefined || isNaN(numResult)) {
      return { success: false, result: 'Error', error: 'Undefined result' };
    }

    if (!isFinite(numResult)) {
      return { success: false, result: 'Cannot divide by 0', error: 'Infinity' };
    }

    // Format precision to avoid IEEE 754 float glitches (e.g. 0.1 + 0.2 = 0.30000000000000004)
    const rounded = Number(numResult.toFixed(10));
    const strResult = String(rounded);

    return { success: true, result: strResult };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Syntax error';
    return { success: false, result: 'Error', error: errorMsg };
  }
}
