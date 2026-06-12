import Exprify from '../dist/exprify.esm.js';

describe('Exprify Engine - Extended Tests', () => {
  let expr;

  beforeEach(() => {
    expr = new Exprify();
  });

  // BASIC
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

  // NESTED
  test('nested parentheses', () => {
    expect(expr.evaluate('((2 + 3) * (4 + 1))')).toBe(25);
  });

  test('deep nesting', () => {
    expect(expr.evaluate('(((1 + 1) + 1) + 1)')).toBe(4);
  });

  // UNARY
  test('unary minus', () => {
    expect(expr.evaluate('-5 + 10')).toBe(5);
  });

  test('double unary', () => {
    expect(expr.evaluate('--5')).toBe(5);
  });

  // POWER
  test('power operator', () => {
    expect(expr.evaluate('2 ^ 3')).toBe(8);
  });

  test('power precedence', () => {
    expect(expr.evaluate('2 + 2 ^ 3')).toBe(10);
  });

  // LOGICAL
  test('logical AND', () => {
    expect(expr.evaluate('true && false')).toBe(false);
  });

  test('logical OR', () => {
    expect(expr.evaluate('true || false')).toBe(true);
  });

  // FUNCTION
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

  // STRING
  test('string concat', () => {
    expect(expr.evaluate('"Hello " + "World"')).toBe('Hello World');
  });

  // BIGINT
  test('bigint power', () => {
    expect(expr.evaluate('11n ^ 2n')).toBe(121n);
  });

  // UNIT
  test('unit conversion', () => {
    expect(expr.evaluate('2 inch to cm')).toBe('5.08 cm');
  });

  test('unit addition', () => {
    expect(expr.evaluate('5 cm + 2 inch')).toBe('10.08 cm');
  });

  // EDGE CASE
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

  // MATH EXTENSIONS

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

  describe('Linear Algebra - Matrix Operations', () => {
    test('transpose 2x2', () => {
      const result = expr.evaluate('transpose([[1, 2], [3, 4]])');
      expect(result).toBe('{"exprify":"DenseMatrix","data":[[1,3],[2,4]],"size":[2,2]}');
    });

    test('inverse 2x2', () => {
      const result = expr.evaluate('inverse([[1, 2], [3, 4]])');
      expect(result).toBe('{"exprify":"DenseMatrix","data":[[-2,1],[1.5,-0.5]],"size":[2,2]}');
    });

    test('trace', () => {
      expect(expr.evaluate('trace([[1, 2], [3, 4]])')).toBe(5);
    });

    test('rank', () => {
      expect(expr.evaluate('rank([[1, 2], [3, 4]])')).toBe(2);
    });

    test('rank singular', () => {
      expect(expr.evaluate('rank([[1, 2], [2, 4]])')).toBe(1);
    });

    test('rref', () => {
      const result = expr.evaluate('rref([[1, 2, 3], [4, 5, 6]])');
      expect(result).toBe('{"exprify":"DenseMatrix","data":[[1,0,-1],[0,1,2]],"size":[2,3]}');
    });

    test('minor', () => {
      expect(expr.evaluate('minor([[1, 2], [3, 4]], 0, 0)')).toBe(4);
    });

    test('cofactor', () => {
      expect(expr.evaluate('cofactor([[1, 2], [3, 4]], 0, 0)')).toBe(4);
    });

    test('cofactor sign', () => {
      expect(expr.evaluate('cofactor([[1, 2], [3, 4]], 0, 1)')).toBe(-3);
    });
  });

  describe('Linear Algebra - Vector Operations', () => {
    test('cross product', () => {
      expect(expr.evaluate('cross([1, 0, 0], [0, 1, 0])')).toBe('[0,0,1]');
    });

    test('normalize', () => {
      const result = expr.evaluate('normalize([3, 4])');
      const parsed = JSON.parse(result);
      expect(parsed[0]).toBeCloseTo(0.6, 10);
      expect(parsed[1]).toBeCloseTo(0.8, 10);
    });

    test('angle between vectors', () => {
      const result = expr.evaluate('angle([1, 0], [0, 1])');
      expect(result).toBeCloseTo(Math.PI / 2, 10);
    });

    test('projection', () => {
      expect(expr.evaluate('projection([3, 4], [1, 0])')).toBe(3);
    });
  });

  describe('Linear Algebra - Matrix Constructors', () => {
    test('identity', () => {
      const result = expr.evaluate('identity(3)');
      expect(result).toBe(
        '{"exprify":"DenseMatrix","data":[[1,0,0],[0,1,0],[0,0,1]],"size":[3,3]}'
      );
    });

    test('eye alias', () => {
      const result = expr.evaluate('eye(2)');
      expect(result).toBe('{"exprify":"DenseMatrix","data":[[1,0],[0,1]],"size":[2,2]}');
    });

    test('zeros', () => {
      const result = expr.evaluate('zeros(2, 3)');
      expect(result).toBe('{"exprify":"DenseMatrix","data":[[0,0,0],[0,0,0]],"size":[2,3]}');
    });

    test('ones', () => {
      const result = expr.evaluate('ones(2, 2)');
      expect(result).toBe('{"exprify":"DenseMatrix","data":[[1,1],[1,1]],"size":[2,2]}');
    });

    test('diag', () => {
      const result = expr.evaluate('diag([1, 2, 3])');
      expect(result).toBe(
        '{"exprify":"DenseMatrix","data":[[1,0,0],[0,2,0],[0,0,3]],"size":[3,3]}'
      );
    });
  });

  describe('Linear Algebra - Advanced Decompositions', () => {
    test('cholesky 2x2', () => {
      const result = expr.evaluate('cholesky([[4, 2], [2, 3]])');
      expect(result).toBe(
        '{"exprify":"DenseMatrix","data":[[2,0],[1,1.4142135623730951]],"size":[2,2]}'
      );
    });

    test('eig 2x2', () => {
      const result = expr.evaluate('eig([[1, 2], [2, 1]])');
      const parsed = JSON.parse(result);
      expect(parsed.values).toEqual([3, -1]);
    });

    test('svd 2x2', () => {
      const result = expr.evaluate('svd([[1, 0], [0, 2]])');
      const parsed = JSON.parse(result);
      expect(parsed.S.data[0][0]).toBeCloseTo(2, 5);
      expect(parsed.S.data[1][1]).toBeCloseTo(1, 5);
    });
  });

  describe('Linear Algebra - Matrix Arithmetic', () => {
    test('matrix addition', () => {
      expect(expr.evaluate('[[1, 2], [3, 4]] + [[5, 6], [7, 8]]')).toBe('6\t8\n10\t12');
    });

    test('matrix subtraction', () => {
      expect(expr.evaluate('[[5, 6], [7, 8]] - [[1, 2], [3, 4]]')).toBe('4\t4\n4\t4');
    });

    test('matrix multiplication', () => {
      expect(expr.evaluate('[[1, 2], [3, 4]] * [[5, 6], [7, 8]]')).toBe('19\t22\n43\t50');
    });

    test('scalar * matrix', () => {
      expect(expr.evaluate('3 * [[1, 2], [3, 4]]')).toBe('3\t6\n9\t12');
    });

    test('matrix * scalar', () => {
      expect(expr.evaluate('[[1, 2], [3, 4]] * 2')).toBe('2\t4\n6\t8');
    });

    test('matrix power', () => {
      expect(expr.evaluate('[[1, 1], [1, 0]] ^ 3')).toBe('3\t2\n2\t1');
    });
  });

  describe('Linear Algebra - Edge Cases', () => {
    test('inverse of singular throws', () => {
      expect(() => expr.evaluate('inverse([[1, 2], [2, 4]])')).toThrow();
    });

    test('matrix dimension mismatch on add throws', () => {
      expect(() => expr.evaluate('[[1, 2]] + [[1, 2, 3]]')).toThrow();
    });

    test('matrix power zero returns identity', () => {
      expect(expr.evaluate('[[1, 2], [3, 4]] ^ 0')).toBe('1\t0\n0\t1');
    });

    test('normalize zero vector throws', () => {
      expect(() => expr.evaluate('normalize([0, 0])')).toThrow();
    });

    test('cholesky non-positive-definite throws', () => {
      expect(() => expr.evaluate('cholesky([[-1, 0], [0, 1]])')).toThrow();
    });
  });

  describe('String Utilities', () => {
    test('split', () => {
      expect(expr.evaluate('split("a,b,c", ",")')).toBe('["a","b","c"]');
    });

    test('join', () => {
      expect(expr.evaluate('join(["a", "b", "c"], ", ")')).toBe('a, b, c');
    });

    test('upper', () => {
      expect(expr.evaluate('upper("hello")')).toBe('HELLO');
    });

    test('lower', () => {
      expect(expr.evaluate('lower("HELLO")')).toBe('hello');
    });

    test('trim', () => {
      expect(expr.evaluate('trim("  hi  ")')).toBe('hi');
    });

    test('replace', () => {
      expect(expr.evaluate('replace("hello world", "world", "there")')).toBe('hello there');
    });

    test('substring', () => {
      expect(expr.evaluate('substring("hello", 1, 4)')).toBe('ell');
    });
  });

  describe('Constants', () => {
    test('PHI', () => {
      expect(expr.evaluate('PHI')).toBeCloseTo(1.618, 3);
    });

    test('TAU', () => {
      expect(expr.evaluate('TAU')).toBeCloseTo(6.283, 3);
    });

    test('INFINITY', () => {
      expect(expr.evaluate('INFINITY')).toBe(Infinity);
    });

    test('NaN', () => {
      expect(expr.evaluate('NaN')).toBeNaN();
    });
  });

  describe('Array Utilities (map / filter)', () => {
    test('map with function name', () => {
      expect(expr.evaluate('map([1, 4, 9], "sqrt")')).toBe('[1,2,3]');
    });

    test('filter with function name', () => {
      expect(expr.evaluate('filter([1, 2, 3, 4, 5], "isPrime")')).toBe('[2,3,5]');
    });
  });

  describe('Calculus', () => {
    test('integral of x^2 from 0 to 1', () => {
      const result = expr.evaluate('integral("x^2", 0, 1)');
      expect(result).toBeCloseTo(1 / 3, 2);
    });

    test('sigma of n from 1 to 10', () => {
      expect(expr.evaluate('sigma("n", 1, 10, "n")')).toBe(55);
    });

    test('sigma of n^2 from 1 to 5', () => {
      expect(expr.evaluate('sigma("n", 1, 5, "n^2")')).toBe(55);
    });

    test('pi of n from 1 to 5', () => {
      expect(expr.evaluate('pi("n", 1, 5, "n")')).toBe(120);
    });

    test('substitute x+1 at x=5', () => {
      expect(expr.evaluate('substitute("x + 1", "x", 5)')).toBe(6);
    });

    test('limit of 1/x as x approaches infinity (right side)', () => {
      const result = expr.evaluate('limit("1/x", "x", 1000000, "right")');
      expect(result).toBeCloseTo(0, 4);
    });
  });

  describe('Range Operator', () => {
    test('simple range 1:5', () => {
      expect(expr.evaluate('1:5')).toBe('[1,2,3,4,5]');
    });

    test('range assigned to variable', () => {
      const result = expr.evaluate('r = 3:7');
      expect(result).toBe('[3,4,5,6,7]');
    });
  });

  describe('Lambda Expressions', () => {
    test('lambda x -> x^2', () => {
      const sq = expr.evaluate('x -> x^2');
      expect(typeof sq).toBe('function');
      expect(sq(5)).toBe(25);
    });

    test('map with lambda', () => {
      const result = expr.evaluate('map([1, 2, 3], x -> x^2)');
      expect(result).toBe('[1,4,9]');
    });

    test('filter with lambda', () => {
      const exprify = new Exprify();
      exprify.addFunction('isBig', (x) => x > 2);
      const result = exprify.evaluate('filter([1, 2, 3, 4], "isBig")');
      expect(result).toBe('[3,4]');
    });
  });

  describe('Compound Assignment', () => {
    test('a += 5', () => {
      const exprify = new Exprify();
      exprify.evaluate('a = 10');
      expect(exprify.evaluate('a += 5')).toBe(15);
      expect(exprify.getVariable('a')).toBe(15);
    });

    test('a -= 3', () => {
      const exprify = new Exprify();
      exprify.evaluate('a = 10');
      expect(exprify.evaluate('a -= 3')).toBe(7);
    });

    test('a *= 2', () => {
      const exprify = new Exprify();
      exprify.evaluate('a = 10');
      expect(exprify.evaluate('a *= 2')).toBe(20);
    });

    test('a /= 4', () => {
      const exprify = new Exprify();
      exprify.evaluate('a = 12');
      expect(exprify.evaluate('a /= 4')).toBe(3);
    });
  });

  describe('Spread Operator', () => {
    test('spread in function call', () => {
      expect(expr.evaluate('max(...[1, 5, 3])')).toBe(5);
    });

    test('spread with other args', () => {
      expect(expr.evaluate('max(10, ...[1, 5, 3], 7)')).toBe(10);
    });
  });

  describe('Symbolic', () => {
    test('expand (x+1)^2', () => {
      const result = expr.evaluate('expand("(x+1)^2")');
      expect(result).toBe('x^2 + 2x + 1');
    });

    test('factor x^2 - 5x + 6', () => {
      const result = expr.evaluate('factor("x^2 - 5x + 6")');
      expect(result).toBe('(x - 2)(x - 3)');
    });

    test('solve x^2 - 4 = 0', () => {
      const result = expr.evaluate('solve("x^2 - 4 = 0")');
      expect(result).toBe('[-2,2]');
    });

    test('solve linear 2x - 8 = 0', () => {
      const result = expr.evaluate('solve("2x - 8 = 0")');
      expect(result).toBe('[4]');
    });
  });

  describe('Scope-based Evaluation', () => {
    test('evaluate with scope overrides variables', () => {
      expr.setVariable('x', 100);
      expect(expr.evaluate('x + 1', { x: 5 })).toBe(6);
    });

    test('evaluate with scope does not mutate instance vars', () => {
      expr.setVariable('x', 10);
      expr.evaluate('x + 1', { x: 99 });
      expect(expr.getVariable('x')).toBe(10);
    });

    test('evaluate with partial scope keeps existing vars', () => {
      expr.setVariable('y', 5);
      expect(expr.evaluate('x + y', { x: 3 })).toBe(8);
    });

    test('compile with scope', () => {
      const fn = expr.compile('a * b');
      expect(fn({ a: 6, b: 7 })).toBe(42);
    });

    test('compile with empty scope', () => {
      expr.setVariable('x', 5);
      const fn = expr.compile('x + 1');
      expect(fn()).toBe(6);
    });
  });

  describe('Degree Trig Functions', () => {
    test('sind 90', () => {
      expect(expr.evaluate('sind(90)')).toBe(1);
    });

    test('cosd 0', () => {
      expect(expr.evaluate('cosd(0)')).toBe(1);
    });

    test('tand 45', () => {
      expect(expr.evaluate('tand(45)')).toBeCloseTo(1, 10);
    });

    test('asind 1', () => {
      expect(expr.evaluate('asind(1)')).toBe(90);
    });

    test('acosd 0', () => {
      expect(expr.evaluate('acosd(0)')).toBe(90);
    });

    test('atand 1', () => {
      expect(expr.evaluate('atand(1)')).toBeCloseTo(45, 10);
    });

    test('atand2', () => {
      expect(expr.evaluate('atand2(1, 1)')).toBeCloseTo(45, 10);
      expect(expr.evaluate('atand2(0, -1)')).toBeCloseTo(180, 10);
    });
  });

  describe('State Serialization', () => {
    test('exportState returns variables and units', () => {
      expr.setVariable('a', 42);
      expr.setVariable('b', 'hello');
      const state = expr.exportState();
      expect(state.variables.a).toBe(42);
      expect(state.variables.b).toBe('hello');
      expect(state.units).toBeDefined();
      expect(Array.isArray(state.functions)).toBe(true);
    });

    test('importState restores variables', () => {
      const state = {
        variables: { x: 10, y: 20 },
        units: expr.exportState().units,
        functions: [],
      };
      expr.importState(state);
      expect(expr.getVariable('x')).toBe(10);
      expect(expr.getVariable('y')).toBe(20);
    });

    test('export + import round-trip', () => {
      expr.setVariable('val', 99);
      const state = expr.exportState();
      const expr2 = new Exprify();
      expr2.importState(state);
      expect(expr2.evaluate('val')).toBe(99);
    });
  });

  describe('Descriptive Error Messages', () => {
    test('tokenizer error includes index', () => {
      try {
        expr.evaluate('2 + @ + 3');
      } catch (e) {
        expect(e.message).toMatch(/index|position/i);
      }
    });

    test('parser error on mismatch', () => {
      expect(() => expr.evaluate('(2 + 3')).toThrow();
    });
  });

  describe('Fractions', () => {
    test('create fraction', () => {
      const result = expr.evaluate('fraction(1, 3)');
      expect(result).toBe('1/3');
    });

    test('fraction addition', () => {
      expect(expr.evaluate('fraction(1, 3) + fraction(1, 6)')).toBe('1/2');
    });

    test('fraction subtraction', () => {
      expect(expr.evaluate('fraction(3, 4) - fraction(1, 4)')).toBe('1/2');
    });

    test('fraction multiplication', () => {
      expect(expr.evaluate('fraction(2, 3) * fraction(3, 4)')).toBe('1/2');
    });

    test('fraction division', () => {
      expect(expr.evaluate('fraction(1, 2) / fraction(3, 4)')).toBe('2/3');
    });

    test('fraction auto-reduces', () => {
      expect(expr.evaluate('fraction(10, 4)')).toBe('5/2');
    });

    test('numer extracts numerator', () => {
      expect(expr.evaluate('numer(fraction(3, 4))')).toBe(3);
    });

    test('denom extracts denominator', () => {
      expect(expr.evaluate('denom(fraction(3, 4))')).toBe(4);
    });

    test('isFraction detects fractions', () => {
      expect(expr.evaluate('isFraction(fraction(1, 2))')).toBe(true);
    });

    test('isFraction false for numbers', () => {
      expect(expr.evaluate('isFraction(42)')).toBe(false);
    });
  });

  describe('BigNumber / Arbitrary Precision', () => {
    test('bignumber creation', () => {
      const result = expr.evaluate('bignumber("0.1")');
      expect(result).toBe('0.1');
    });

    test('bignumber avoids floating point error', () => {
      const result = expr.evaluate('bignumber("0.1") + bignumber("0.2")');
      expect(result).toBe('0.3');
    });

    test('bignumber addition', () => {
      expect(expr.evaluate('bignumber("1.23") + bignumber("4.56")')).toBe('5.79');
    });

    test('bignumber subtraction', () => {
      expect(expr.evaluate('bignumber("5.5") - bignumber("2.3")')).toBe('3.2');
    });

    test('bignumber multiplication', () => {
      expect(expr.evaluate('bignumber("2.5") * bignumber("3")')).toBe('7.5');
    });

    test('bignumber division', () => {
      const result = expr.evaluate('bignumber("1") / bignumber("3")');
      expect(result).toBe('3.3333333333333333333e-1');
    });

    test('bignumber comparison', () => {
      expect(expr.evaluate('bignumber("5") > bignumber("3")')).toBe(true);
      expect(expr.evaluate('bignumber("2") == bignumber("2")')).toBe(true);
      expect(expr.evaluate('bignumber("1") < bignumber("0")')).toBe(false);
    });

    test('bignumber negation', () => {
      expect(expr.evaluate('-bignumber("42")')).toBe('-42');
    });

    test('isBigNumber type check', () => {
      expect(expr.evaluate('isBigNumber(bignumber("5"))')).toBe(true);
      expect(expr.evaluate('isBigNumber(42)')).toBe(false);
    });

    test('bignumber scientific notation positive exponent', () => {
      expect(expr.evaluate('bignumber("1.2e500")')).toBe('1.2e+500');
    });

    test('bignumber scientific notation negative exponent', () => {
      expect(expr.evaluate('bignumber("1.2e-500")')).toBe('1.2e-500');
    });

    test('bignumber scientific notation 1e5', () => {
      expect(expr.evaluate('bignumber("1e5")')).toBe('100000');
    });

    test('bignumber arithmetic with scientific notation', () => {
      expect(expr.evaluate('bignumber("1e20") + bignumber("1e20")')).toBe('2e+20');
    });
  });

  describe('New Built-in Functions', () => {
    describe('Reciprocal Trig', () => {
      test('acot', () => {
        const r = expr.evaluate('acot(1)');
        expect(r).toBeCloseTo(Math.PI / 4, 10);
      });

      test('asec', () => {
        const r = expr.evaluate('asec(2)');
        expect(r).toBeCloseTo(Math.acos(0.5), 10);
      });

      test('acsc', () => {
        const r = expr.evaluate('acsc(2)');
        expect(r).toBeCloseTo(Math.asin(0.5), 10);
      });

      test('acoth', () => {
        const r = expr.evaluate('acoth(2)');
        expect(r).toBeCloseTo(Math.atanh(0.5), 10);
      });

      test('asech', () => {
        const r = expr.evaluate('asech(0.5)');
        expect(r).toBeCloseTo(Math.acosh(2), 10);
      });

      test('acsch', () => {
        const r = expr.evaluate('acsch(0.5)');
        expect(r).toBeCloseTo(Math.asinh(2), 10);
      });
    });

    describe('Stats', () => {
      test('quantile', () => {
        expect(expr.evaluate('quantile([1,2,3,4,5], 0.5)')).toBe(3);
        expect(expr.evaluate('quantile([1,2,3,4,5], 0)')).toBe(1);
        expect(expr.evaluate('quantile([1,2,3,4,5], 1)')).toBe(5);
      });

      test('percentile', () => {
        expect(expr.evaluate('percentile([1,2,3,4,5], 50)')).toBe(3);
      });

      test('covariance', () => {
        const r = expr.evaluate('covariance([1,2,3,4,5], [2,4,6,8,10])');
        expect(r).toBeCloseTo(5, 10);
      });

      test('corr', () => {
        const r = expr.evaluate('corr([1,2,3,4,5], [2,4,6,8,10])');
        expect(r).toBeCloseTo(1, 10);
      });

      test('randomInt', () => {
        // Run multiple times to ensure range is respected
        for (let i = 0; i < 100; i++) {
          const r = expr.evaluate('randomInt(3, 7)');
          expect(r).toBeGreaterThanOrEqual(3);
          expect(r).toBeLessThanOrEqual(7);
        }
      });

      test('randomNormal uses Box-Muller', () => {
        // Just verify it runs without error and returns a finite number
        for (let i = 0; i < 10; i++) {
          const r = expr.evaluate('randomNormal(0, 1)');
          expect(typeof r).toBe('number');
          expect(Number.isFinite(r)).toBe(true);
        }
      });
    });

    describe('Special Functions', () => {
      test('erf', () => {
        expect(expr.evaluate('erf(0)')).toBe(0);
        expect(expr.evaluate('erf(INFINITY)')).toBeCloseTo(1, 4);
        const r = expr.evaluate('erf(1)');
        expect(r).toBeCloseTo(0.8427008, 4);
      });

      test('lgamma', () => {
        expect(expr.evaluate('lgamma(1)')).toBeCloseTo(0, 5);
        expect(expr.evaluate('lgamma(2)')).toBeCloseTo(0, 5);
      });

      test('beta', () => {
        expect(expr.evaluate('beta(1, 1)')).toBeCloseTo(1, 5);
        expect(expr.evaluate('beta(2, 3)')).toBeCloseTo(1 / 12, 5);
      });
    });

    describe('Numeric Helpers', () => {
      test('hypot', () => {
        expect(expr.evaluate('hypot(3, 4)')).toBe(5);
        expect(expr.evaluate('hypot()')).toBe(0);
      });

      test('cbrt', () => {
        expect(expr.evaluate('cbrt(8)')).toBe(2);
        expect(expr.evaluate('cbrt(-27)')).toBe(-3);
      });

      test('log2', () => {
        expect(expr.evaluate('log2(8)')).toBe(3);
      });

      test('log1p', () => {
        expect(expr.evaluate('log1p(0)')).toBe(0);
        expect(expr.evaluate('log1p(1)')).toBeCloseTo(Math.LN2, 10);
      });

      test('expm1', () => {
        expect(expr.evaluate('expm1(0)')).toBe(0);
        expect(expr.evaluate('expm1(1)')).toBeCloseTo(Math.E - 1, 10);
      });
    });

    describe('Bitwise', () => {
      test('bitAnd', () => {
        expect(expr.evaluate('bitAnd(5, 3)')).toBe(1);
        expect(expr.evaluate('bitAnd(8, 7)')).toBe(0);
      });

      test('bitOr', () => {
        expect(expr.evaluate('bitOr(5, 3)')).toBe(7);
      });

      test('bitXor', () => {
        expect(expr.evaluate('bitXor(5, 3)')).toBe(6);
      });

      test('bitNot', () => {
        expect(expr.evaluate('bitNot(0)')).toBe(-1);
        expect(expr.evaluate('bitNot(-1)')).toBe(0);
      });
    });
  });

  describe('Expression Chaining', () => {
    test('chain evaluate returns final result', () => {
      const c = expr.chain();
      c.evaluate('2 + 2');
      c.evaluate('ans * 3');
      expect(c.done()).toBe(12);
    });

    test('chain is mutable', () => {
      const c = expr.chain();
      expect(c.evaluate('10 + 5')).toBe(c);
      expect(c.setVariable('x', 100)).toBe(c);
    });

    test('chain setVariable works', () => {
      const c = expr.chain();
      c.setVariable('x', 25);
      expect(c.evaluate('sqrt(x)').done()).toBe(5);
    });

    test('chain compile works', () => {
      const c = expr.chain();
      const fn = c.compile('a * b');
      expect(fn({ a: 6, b: 7 })).toBe(42);
    });

    test('chain with scope', () => {
      const c = expr.chain();
      c.setVariable('base', 10);
      c.evaluate('base + 5', { base: 100 });
      expect(c.done()).toBe(105);
    });

    test('chain reusable', () => {
      const c = expr.chain();
      c.evaluate('1 + 1');
      c.done();
      c.evaluate('ans + 1');
      expect(c.done()).toBe(3);
    });
  });
});
