import Exprify from '../dist/exprify.esm.js';

describe('Units - Individual Feature Tests', () => {
  let expr;

  beforeEach(() => {
    expr = new Exprify();
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Length
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Length', () => {
    test('m to cm', () => {
      expect(expr.evaluate('2 m to cm')).toBe('200 cm');
    });

    test('cm to m', () => {
      expect(expr.evaluate('100 cm to m')).toBe('1 m');
    });

    test('ft to inch', () => {
      const result = expr.evaluate('1 ft to inch');
      const [num] = result.split(' ');
      expect(parseFloat(num)).toBeCloseTo(12);
      expect(result).toMatch(/inch$/);
    });

    test('km to m', () => {
      expect(expr.evaluate('1 km to m')).toBe('1000 m');
    });

    test('nmi to m', () => {
      expect(expr.evaluate('1 nmi to m')).toBe('1852 m');
    });

    test('mm to cm', () => {
      expect(expr.evaluate('10 mm to cm')).toBe('1 cm');
    });

    test('inch to mm', () => {
      expect(expr.evaluate('1 inch to mm')).toBe('25.4 mm');
    });

    test('yd to ft', () => {
      expect(expr.evaluate('1 yd to ft')).toBe('3 ft');
    });

    test('mi to km', () => {
      expect(expr.evaluate('1 mi to km')).toBe('1.609344 km');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Weight / Mass
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Weight / Mass', () => {
    test('kg to g', () => {
      expect(expr.evaluate('1 kg to g')).toBe('1000 g');
    });

    test('g to kg', () => {
      expect(expr.evaluate('500 g to kg')).toBe('0.5 kg');
    });

    test('lb to oz', () => {
      expect(expr.evaluate('1 lb to oz')).toBe('16 oz');
    });

    test('t to kg', () => {
      expect(expr.evaluate('1 t to kg')).toBe('1000 kg');
    });

    test('oz to g reverse', () => {
      expect(expr.evaluate('1 oz to g')).toBe('28.3495 g');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Time
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Time', () => {
    test('h to s', () => {
      expect(expr.evaluate('1 h to s')).toBe('3600 s');
    });

    test('s to h reverse', () => {
      expect(expr.evaluate('3600 s to h')).toBe('1 h');
    });

    test('min to h', () => {
      expect(expr.evaluate('60 min to h')).toBe('1 h');
    });

    test('day to h', () => {
      expect(expr.evaluate('1 day to h')).toBe('24 h');
    });

    test('week to day', () => {
      expect(expr.evaluate('1 week to day')).toBe('7 day');
    });

    test('month to day approximate', () => {
      const result = expr.evaluate('1 month to day');
      expect(parseFloat(result)).toBeCloseTo(30.44, 1);
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Electrical (uses keys: V, mV, kV, A, mA, kA, F, mF, H, mH)
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Electrical', () => {
    test('volt to millivolt', () => {
      expect(expr.evaluate('1 volt to millivolt')).toBe('1000 mV');
    });

    test('kilovolt to volt', () => {
      expect(expr.evaluate('1 kilovolt to volt')).toBe('1000 V');
    });

    test('ampere to milliampere', () => {
      expect(expr.evaluate('1 ampere to milliampere')).toBe('1000 mA');
    });

    test('kiloampere to ampere', () => {
      expect(expr.evaluate('1 kiloampere to ampere')).toBe('1000 A');
    });

    test('kiloohm to ohm', () => {
      expect(expr.evaluate('1 kohm to ohm')).toBe('1000 ohm');
    });

    test('farad to millifarad', () => {
      expect(expr.evaluate('1 farad to millifarad')).toBe('1000 mF');
    });

    test('henry to millihenry', () => {
      expect(expr.evaluate('1 henry to millihenry')).toBe('1000 mH');
    });

    test('uppercase V volt to mV', () => {
      expect(expr.evaluate('1 V to mV')).toBe('1000 mV');
    });

    test('uppercase A ampere to mA', () => {
      expect(expr.evaluate('1 A to mA')).toBe('1000 mA');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Frequency / Power (uses keys: Hz, kHz, MHz, W, kW, MW, HP)
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Frequency / Power', () => {
    test('megahertz to hertz', () => {
      expect(expr.evaluate('1 megahertz to hertz')).toBe('1000000 Hz');
    });

    test('kilohertz to hertz', () => {
      expect(expr.evaluate('1 kilohertz to hertz')).toBe('1000 Hz');
    });

    test('kilowatt to watt', () => {
      expect(expr.evaluate('1 kilowatt to watt')).toBe('1000 W');
    });

    test('megawatt to kilowatt', () => {
      expect(expr.evaluate('1 megawatt to kilowatt')).toBe('1000 kW');
    });

    test('horsepower to watt', () => {
      expect(expr.evaluate('1 horsepower to watt')).toBe('745.7 W');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Pressure / Energy / Force
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Pressure / Energy / Force', () => {
    test('atmosphere to pascal', () => {
      expect(expr.evaluate('1 atm to pascal')).toBe('101325 Pa');
    });

    test('bar to kilopascal', () => {
      expect(expr.evaluate('1 bar to kilopascal')).toBe('100 kPa');
    });

    test('kilojoule to joule', () => {
      expect(expr.evaluate('1 kilojoule to joule')).toBe('1000 J');
    });

    test('calorie to joule', () => {
      expect(expr.evaluate('1 cal to joule')).toBe('4.184 J');
    });

    test('kilonewton to newton', () => {
      expect(expr.evaluate('1 kilonewton to newton')).toBe('1000 N');
    });

    test('kilogram-force to newton', () => {
      const result = expr.evaluate('1 kgf to newton');
      expect(parseFloat(result)).toBeCloseTo(9.80665);
      expect(result).toMatch(/ N$/);
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Temperature
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Temperature', () => {
    test('98.6 F to C', () => {
      expect(expr.evaluate('98.6 F to C')).toBe('37 C');
    });

    test('32 F to C', () => {
      expect(expr.evaluate('32 F to C')).toBe('0 C');
    });

    test('0 C to F', () => {
      expect(expr.evaluate('0 C to F')).toBe('32 F');
    });

    test('100 C to F', () => {
      expect(expr.evaluate('100 C to F')).toBe('212 F');
    });

    test('0 C to K', () => {
      expect(expr.evaluate('0 C to K')).toBe('273.15 K');
    });

    test('273.15 K to C', () => {
      expect(expr.evaluate('273.15 K to C')).toBe('0 C');
    });

    test('212 F to K', () => {
      expect(expr.evaluate('212 F to K')).toBe('373.15 K');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Name Disambiguation (F, rad, S share keys across categories)
  // ---------------------------------------------------------------------------
  describe('Unit Name Disambiguation', () => {
    test('F with mF resolves to farad (capacitance)', () => {
      expect(expr.evaluate('1 F to mF')).toBe('1000 mF');
    });

    test('F with uF arithmetic resolves to farad', () => {
      const result = expr.evaluate('1 F + 1000 uF');
      expect(parseFloat(result)).toBeCloseTo(1.001);
      expect(result).toMatch(/ F$/);
    });

    test('F with C resolves to fahrenheit (temperature)', () => {
      expect(expr.evaluate('98.6 F to C')).toBe('37 C');
    });

    test('F with K resolves to fahrenheit (temperature)', () => {
      expect(expr.evaluate('212 F to K')).toBe('373.15 K');
    });

    test('rad with deg resolves to angle', () => {
      expect(expr.evaluate('1 rad to deg')).toBe('57.2958 deg');
    });

    test('rad with Gy resolves to radiation', () => {
      expect(expr.evaluate('1 rad to Gy')).toBe('0.01 Gy');
    });

    test('S (siemens) to ohm resolves to resistance', () => {
      expect(expr.evaluate('1 S to ohm')).toBe('1 ohm');
    });

    test('s (second) to min resolves to time', () => {
      expect(expr.evaluate('60 s to min')).toBe('1 min');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Conversions - Area / Volume / Data / Angle / Radiation
  // ---------------------------------------------------------------------------
  describe('Unit Conversions - Area / Volume / Data / Angle / Radiation', () => {
    test('square meter to square centimeter', () => {
      const result = expr.evaluate('1 m2 to cm2');
      expect(parseFloat(result)).toBeCloseTo(10000);
      expect(result).toMatch(/cm2$/);
    });

    test('hectare to square meter', () => {
      expect(expr.evaluate('1 hectare to m2')).toBe('10000 m2');
    });

    test('liter to milliliter', () => {
      const result = expr.evaluate('1 liter to milliliter');
      expect(parseFloat(result)).toBeCloseTo(1000);
      expect(result).toMatch(/ mL$/);
    });

    test('cubic meter to liter', () => {
      const result = expr.evaluate('1 m3 to liter');
      expect(parseFloat(result)).toBeCloseTo(1000);
      expect(result).toMatch(/ L$/);
    });

    test('gallon to liter', () => {
      const result = expr.evaluate('1 gallon to liter');
      expect(parseFloat(result)).toBeCloseTo(3.78541);
      expect(result).toMatch(/ L$/);
    });

    test('megabyte to kilobyte', () => {
      expect(expr.evaluate('1 megabyte to kilobyte')).toBe('1000 KB');
    });

    test('gigabyte to byte', () => {
      expect(expr.evaluate('1 gigabyte to byte')).toBe('1000000000 B');
    });

    test('radian to degree', () => {
      expect(expr.evaluate('1 radian to degree')).toBe('57.2958 deg');
    });

    test('degree to grad', () => {
      expect(expr.evaluate('90 degree to grad')).toBe('100 grad');
    });

    test('sievert to millisievert', () => {
      expect(expr.evaluate('1 sievert to millisievert')).toBe('1000 mSv');
    });

    test('becquerel to kilobecquerel', () => {
      expect(expr.evaluate('1000 becquerel to kilobecquerel')).toBe('1 kBq');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Keyword: "in" (alias for "to")
  // ---------------------------------------------------------------------------
  describe('Unit Keyword "in"', () => {
    test('2 inch in cm equals 2 inch to cm', () => {
      expect(expr.evaluate('2 inch in cm')).toBe('5.08 cm');
    });

    test('1 kg in g', () => {
      expect(expr.evaluate('1 kg in g')).toBe('1000 g');
    });

    test('1 h in min', () => {
      expect(expr.evaluate('1 h in min')).toBe('60 min');
    });

    test('expression with in keyword', () => {
      const result = expr.evaluate('(5 ft + 2 inch) in cm');
      const [num] = result.split(' ');
      expect(parseFloat(num)).toBeCloseTo(157.48);
      expect(result).toMatch(/ cm$/);
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Arithmetic
  // ---------------------------------------------------------------------------
  describe('Unit Arithmetic', () => {
    test('same unit addition', () => {
      expect(expr.evaluate('5 cm + 3 cm')).toBe('8 cm');
    });

    test('cross-unit addition', () => {
      expect(expr.evaluate('5 cm + 2 mm')).toBe('5.2 cm');
    });

    test('cross-unit subtraction', () => {
      expect(expr.evaluate('10 cm - 5 mm')).toBe('9.5 cm');
    });

    test('scalar times unit', () => {
      expect(expr.evaluate('3 * 5 cm')).toBe('15 cm');
    });

    test('unit times scalar', () => {
      expect(expr.evaluate('5 cm * 3')).toBe('15 cm');
    });

    test('unit divided by scalar', () => {
      expect(expr.evaluate('10 cm / 2')).toBe('5 cm');
    });

    test('time addition across units', () => {
      expect(expr.evaluate('1 h + 30 min')).toBe('1.5 h');
    });

    test('weight addition across units', () => {
      expect(expr.evaluate('1 kg + 500 g')).toBe('1.5 kg');
    });

    test('zero value with unit', () => {
      expect(expr.evaluate('0 kg to g')).toBe('0 g');
    });

    test('unit in variable then convert', () => {
      expr.evaluate('dist = 10 m');
      expect(expr.evaluate('dist to cm')).toBe('1000 cm');
    });
  });

  // ---------------------------------------------------------------------------
  // Unit Error Cases
  // ---------------------------------------------------------------------------
  describe('Unit Error Cases', () => {
    test('incompatible length to weight throws', () => {
      expect(() => expr.evaluate('5 m to kg')).toThrow();
    });

    test('incompatible weight to time throws', () => {
      expect(() => expr.evaluate('10 kg to s')).toThrow();
    });

    test('incompatible addition throws', () => {
      expect(() => expr.evaluate('5 cm + 2 kg')).toThrow();
    });

    test('unknown source unit throws', () => {
      expect(() => expr.evaluate('5 xyz to m')).toThrow();
    });

    test('unknown target unit throws', () => {
      expect(() => expr.evaluate('5 m to xyz')).toThrow();
    });

    test('missing unit after to throws', () => {
      expect(() => expr.evaluate('5 m to')).toThrow();
    });
  });
});
