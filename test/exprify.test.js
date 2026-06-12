import Exprify from '../dist/exprify.esm.js';

describe('Exprify Engine - Extended Tests', () => {
  let expr;

  beforeEach(() => {
    expr = new Exprify();
  });

  /* ================= BASIC ================= */
  test('addition', () => {
    expect(expr.evaluate('2 + 3 + 5')).toBe(10);
  });

  test('operator precedence', () => {
    expect(expr.evaluate('2 + 3 * 4')).toBe(14);
  });

  test('parentheses override precedence', () => {
    expect(expr.evaluate('(2 + 3) * 4')).toBe(20);
  });

  test('mixed parentheses', () => {
    expect(expr.evaluate('(1 + 2) * (3 + 4)')).toBe(21);
  });

  /* ================= NESTED ================= */
  test('nested parentheses', () => {
    expect(expr.evaluate('((2 + 3) * (4 + 1))')).toBe(25);
  });

  test('deep nesting', () => {
    expect(expr.evaluate('(((1 + 1) + 1) + 1)')).toBe(4);
  });

  /* ================= UNARY ================= */
  test('unary minus', () => {
    expect(expr.evaluate('-5 + 10')).toBe(5);
  });

  test('double unary', () => {
    expect(expr.evaluate('--5')).toBe(5);
  });

  /* ================= POWER ================= */
  test('power operator', () => {
    expect(expr.evaluate('2 ^ 3')).toBe(8);
  });

  test('power precedence', () => {
    expect(expr.evaluate('2 + 2 ^ 3')).toBe(10);
  });

  /* ================= LOGICAL ================= */
  test('logical AND', () => {
    expect(expr.evaluate('true && false')).toBe(false);
  });

  test('logical OR', () => {
    expect(expr.evaluate('true || false')).toBe(true);
  });

  /* ================= FUNCTION ================= */
  test('function call', () => {
    expect(expr.evaluate('max(2, 5, 3)')).toBe(5);
  });

  test('nested function', () => {
    expect(expr.evaluate('max(2, min(5, 3))')).toBe(3);
  });

  test('matrix determinant with semicolon rows', () => {
    expect(expr.evaluate('det([-1, 2; 3, 1])')).toBe(-7);
  });

  test('leafCount counts expression leaves from string input', () => {
    expect(expr.evaluate(`leafCount("e^(i*pi)-1")`)).toBe(4);
  });

  test('leafCount works on parsed object expression', () => {
    expect(expr.evaluate(`leafCount(parse("{a: 22/7, b: 10^(1/2)}"))`)).toBe(5);
  });

  /* ================= STRING ================= */
  test('string concat', () => {
    expect(expr.evaluate('"Hello " + "World"')).toBe('Hello World');
  });

  /* ================= BIGINT ================= */
  test('bigint power', () => {
    expect(expr.evaluate('11n ^ 2n')).toBe(121n);
  });

  /* ================= UNIT ================= */
  test('unit conversion', () => {
    expect(expr.evaluate('2 inch to cm')).toBe('5.08 cm');
  });

  test('unit addition', () => {
    expect(expr.evaluate('5 cm + 2 inch')).toBe('10.08 cm');
  });

  /* ================= EDGE CASE ================= */
  test('division', () => {
    expect(expr.evaluate('10 / 2')).toBe(5);
  });

  test('modulus', () => {
    expect(expr.evaluate('10 % 3')).toBe(1);
  });

  test('invalid expression', () => {
    expect(() => expr.evaluate('(2 + 3')).toThrow();
  });

  test('set and use variable', () => {
    expr.setVariable('x', 5);
    expr.setVariable('y', 3);
    expect(expr.evaluate('x + y')).toBe(8);
    expect(expr.evaluate('x * y + 2')).toBe(17); // 5*3=15 +2=17
  });

  test('variable in parentheses', () => {
    expr.setVariable('a', 2);
    expr.setVariable('b', 4);
    expect(expr.evaluate('(a + b) * 3')).toBe(18); // (2+4)*3=18
  });

  test('add and use external function', () => {
    // Example: double(n) returns n*2
    expr.addFunction('double', (n) => n * 2);
    expect(expr.evaluate('double(4)')).toBe(8);
    expect(expr.evaluate('2 + double(5)')).toBe(12); // 2+10=12
  });

  test('external function with multiple arguments', () => {
    expr.addFunction('sumThree', (a, b, c) => a + b + c);
    expect(expr.evaluate('sumThree(2, 3, 5)')).toBe(10);
  });

  test('nested function calls', () => {
    expr.addFunction('double', (n) => n * 2);
    expr.addFunction('addTen', (n) => n + 10);
    expect(expr.evaluate('addTen(double(5))')).toBe(20); // double(5)=10 → addTen(10)=20
  });

  test('matrix assignment returns DenseMatrix metadata', () => {
    expect(expr.evaluate('a = [-2, 3; 2, 1]')).toBe(
      '{"exprify":"DenseMatrix","data":[[-2,3],[2,1]],"size":[2,2]}'
    );
  });

  test('vector assignment returns DenseMatrix metadata', () => {
    expect(expr.evaluate('b = [11, 9]')).toBe('{"exprify":"DenseMatrix","data":[11,9],"size":[2]}');
  });

  test('lsolve returns solution matrix metadata', () => {
    expr.evaluate('a = [-2, 3; 2, 1]');
    expr.evaluate('b = [11, 9]');
    expect(expr.evaluate('x = lsolve(a, b)')).toBe(
      '{"exprify":"DenseMatrix","data":[[2],[5]],"size":[2,1]}'
    );
  });

  test('lup works on raw nested arrays', () => {
    expect(expr.evaluate('lup([[2, 1], [1, 4]])')).toBe(
      '{"L":{"exprify":"DenseMatrix","data":[[1,0],[0.5,1]],"size":[2,2]},"U":{"exprify":"DenseMatrix","data":[[2,1],[0,3.5]],"size":[2,2]},"p":[0,1]}'
    );
  });

  test('lup works on matrix wrapper', () => {
    expect(expr.evaluate('lup(matrix([[2, 1], [1, 4]]))')).toBe(
      '{"L":{"exprify":"DenseMatrix","data":[[1,0],[0.5,1]],"size":[2,2]},"U":{"exprify":"DenseMatrix","data":[[2,1],[0,3.5]],"size":[2,2]},"p":[0,1]}'
    );
  });

  test('lup works on sparse wrapper alias', () => {
    expect(expr.evaluate('lup(sparse([[2, 1], [1, 4]]))')).toBe(
      '{"L":{"exprify":"DenseMatrix","data":[[1,0],[0.5,1]],"size":[2,2]},"U":{"exprify":"DenseMatrix","data":[[2,1],[0,3.5]],"size":[2,2]},"p":[0,1]}'
    );
  });

  test('lyap solves continuous Lyapunov equation from literals', () => {
    expect(expr.evaluate('lyap([[-2, 0], [1, -4]], [[3, 1], [1, 3]])')).toBe(
      '{"exprify":"DenseMatrix","data":[[0.75,0.2916666666666667],[0.2916666666666667,0.44791666666666663]],"size":[2,2]}'
    );
  });

  test('lyap also works with stored matrices', () => {
    expr.evaluate('A = [[-2, 0], [1, -4]]');
    expr.evaluate('Q = [[3, 1], [1, 3]]');
    expect(expr.evaluate('lyap(A, Q)')).toBe(
      '{"exprify":"DenseMatrix","data":[[0.75,0.2916666666666667],[0.2916666666666667,0.44791666666666663]],"size":[2,2]}'
    );
  });

  test('polynomialRoot returns cubic roots', () => {
    expect(expr.evaluate('a = polynomialRoot(-6, 11, -6, 1)')).toBe('[1,3,2]');
  });

  test('qr returns Q and R wrappers', () => {
    expect(expr.evaluate('qr([[1, -1, 4], [1, 4, -2], [1, 4, 2], [1, -1, 0]])')).toBe(
      '{"Q":{"exprify":"DenseMatrix","data":[[0.5,-0.5,0.5,0.5],[0.5,0.5,-0.5,0.5],[0.5,0.5,0.5,-0.5],[0.5,-0.5,-0.5,-0.5]],"size":[4,4]},"R":{"exprify":"DenseMatrix","data":[[2,3,2],[0,5,-2],[0,0,4],[0,0,0]],"size":[4,3]}}'
    );
  });

  test('rationalize returns structured details', () => {
    expect(expr.evaluate('rationalize("2x/y - y/(x+1)", true)')).toBe(
      '{"numerator":"2 * x ^ 2 + 2 * x - y ^ 2","denominator":"x * y + y","coefficients":[],"variables":["x","y"],"expression":"(2 * x ^ 2 + 2 * x - y ^ 2) / (x * y + y)"}'
    );
  });

  test('define and use inline function', () => {
    expr.evaluate('hyp(a, b) = sqrt(a ^ 2 + b ^ 2)');
    expect(expr.evaluate('hyp(3, 4)')).toBe(5);
  });

  test('inline function can use global variables', () => {
    expr.setVariable('scale', 2);
    expr.evaluate('mulScale(x) = x * scale');
    expect(expr.evaluate('mulScale(5)')).toBe(10);
  });

  /* ================= MATH EXTENSIONS ================= */

  describe('Statistics', () => {
    test('sum', () => {
      expect(expr.evaluate('sum(1, 2, 3, 4, 5)')).toBe(15);
    });

    test('prod', () => {
      expect(expr.evaluate('prod(1, 2, 3, 4, 5)')).toBe(120);
    });

    test('mean', () => {
      expect(expr.evaluate('mean(1, 2, 3, 4, 5)')).toBe(3);
    });

    test('median odd count', () => {
      expect(expr.evaluate('median(1, 2, 3, 4, 5)')).toBe(3);
    });

    test('median even count', () => {
      expect(expr.evaluate('median(1, 2, 3, 4)')).toBe(2.5);
    });

    test('mode', () => {
      expect(expr.evaluate('mode(1, 2, 2, 3)')).toBe(2);
    });

    test('std', () => {
      expect(expr.evaluate('std(1, 2, 3, 4, 5)')).toBeCloseTo(1.5811388300841898, 10);
    });

    test('variance', () => {
      expect(expr.evaluate('variance(1, 2, 3, 4, 5)')).toBeCloseTo(2.5, 10);
    });

    test('range', () => {
      expect(expr.evaluate('range(1, 2, 3, 4, 5)')).toBe(4);
    });
  });

  describe('Number Theory', () => {
    test('gcd', () => {
      expect(expr.evaluate('gcd(12, 18)')).toBe(6);
    });

    test('gcd with zero', () => {
      expect(expr.evaluate('gcd(0, 5)')).toBe(5);
    });

    test('lcm', () => {
      expect(expr.evaluate('lcm(12, 18)')).toBe(36);
    });

    test('lcm with zero', () => {
      expect(expr.evaluate('lcm(0, 5)')).toBe(0);
    });

    test('factorial 0', () => {
      expect(expr.evaluate('factorial(0)')).toBe(1);
    });

    test('factorial 5', () => {
      expect(expr.evaluate('factorial(5)')).toBe(120);
    });

    test('isPrime true', () => {
      expect(expr.evaluate('isPrime(17)')).toBe(true);
    });

    test('isPrime false', () => {
      expect(expr.evaluate('isPrime(4)')).toBe(false);
    });

    test('isPrime edge', () => {
      expect(expr.evaluate('isPrime(1)')).toBe(false);
      expect(expr.evaluate('isPrime(2)')).toBe(true);
    });

    test('primeFactors', () => {
      expect(expr.evaluate('primeFactors(12)')).toBe('[2,2,3]');
    });

    test('fibonacci 0', () => {
      expect(expr.evaluate('fibonacci(0)')).toBe(0);
    });

    test('fibonacci 10', () => {
      expect(expr.evaluate('fibonacci(10)')).toBe(55);
    });
  });

  describe('Combinatorics', () => {
    test('nCr', () => {
      expect(expr.evaluate('nCr(5, 2)')).toBe(10);
    });

    test('nCr n==r', () => {
      expect(expr.evaluate('nCr(5, 5)')).toBe(1);
    });

    test('nPr', () => {
      expect(expr.evaluate('nPr(5, 2)')).toBe(20);
    });

    test('gamma integer', () => {
      expect(expr.evaluate('gamma(5)')).toBe(24);
    });
  });

  describe('Extended Trig', () => {
    test('sinh 0', () => {
      expect(expr.evaluate('sinh(0)')).toBe(0);
    });

    test('cosh 0', () => {
      expect(expr.evaluate('cosh(0)')).toBe(1);
    });

    test('tanh 0', () => {
      expect(expr.evaluate('tanh(0)')).toBe(0);
    });

    test('asinh 0', () => {
      expect(expr.evaluate('asinh(0)')).toBe(0);
    });

    test('sec(pi/3)', () => {
      expect(expr.evaluate('sec(pi/3)')).toBeCloseTo(2, 10);
    });

    test('csc(pi/2)', () => {
      expect(expr.evaluate('csc(pi/2)')).toBe(1);
    });

    test('cot(pi/4)', () => {
      expect(expr.evaluate('cot(pi/4)')).toBeCloseTo(1, 10);
    });
  });

  describe('Rounding Variants', () => {
    test('trunc', () => {
      expect(expr.evaluate('trunc(3.7)')).toBe(3);
    });

    test('sign negative', () => {
      expect(expr.evaluate('sign(-5)')).toBe(-1);
    });

    test('sign zero', () => {
      expect(expr.evaluate('sign(0)')).toBe(0);
    });

    test('sign positive', () => {
      expect(expr.evaluate('sign(5)')).toBe(1);
    });

    test('frac', () => {
      expect(expr.evaluate('frac(3.14)')).toBeCloseTo(0.14, 10);
    });
  });

  describe('Math extension edge cases', () => {
    test('factorial rejects negative', () => {
      expect(() => expr.evaluate('factorial(-1)')).toThrow();
    });

    test('factorial rejects float', () => {
      expect(() => expr.evaluate('factorial(3.5)')).toThrow();
    });

    test('mean rejects empty', () => {
      expect(() => expr.evaluate('mean()')).toThrow();
    });

    test('std rejects single value', () => {
      expect(() => expr.evaluate('std(5)')).toThrow();
    });

    test('primeFactors rejects n < 2', () => {
      expect(() => expr.evaluate('primeFactors(1)')).toThrow();
    });

    test('fibonacci rejects negative', () => {
      expect(() => expr.evaluate('fibonacci(-1)')).toThrow();
    });

    test('nCr rejects negative', () => {
      expect(() => expr.evaluate('nCr(-1, 2)')).toThrow();
    });

    test('sec at pi/2 throws', () => {
      expect(() => expr.evaluate('sec(pi/2)')).toThrow();
    });

    test('csc at 0 throws', () => {
      expect(() => expr.evaluate('csc(0)')).toThrow();
    });

    test('cot at 0 throws', () => {
      expect(() => expr.evaluate('cot(0)')).toThrow();
    });
  });
});
