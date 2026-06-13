# Units

Exprify includes over 100 physical units across 20 categories, with automatic conversion, unit-aware arithmetic, and built-in dimensional safety checks. Whether you're converting between metric and imperial systems, working with electrical quantities, or handling temperature scales, Exprify handles the math and the unit bookkeeping for you.

## Supported Categories

| Category | Example Units |
|---|---|
| Length | m, km, cm, mm, mi, yd, ft, in |
| Weight / Mass | kg, g, mg, lb, oz, ton |
| Time | s, ms, min, h, day, week, year |
| Voltage | V, mV, kV |
| Frequency | Hz, kHz, MHz, GHz |
| Power | W, kW, MW, hp |
| Sound | dB, dBA |
| Temperature | C, F, K |
| Pressure | Pa, kPa, bar, psi, atm |
| Energy | J, kJ, cal, kcal, Wh, kWh |
| Force | N, kN, lbf, dyn |
| Area | m², km², ft², acre, hectare |
| Volume | L, mL, m³, gal, ft³ |
| Current | A, mA, kA |
| Resistance | Ω, kΩ, MΩ |
| Capacitance | F, mF, μF, nF, pF |
| Inductance | H, mH, μH |
| Light | lm, lx, cd |
| Data | bit, byte, KB, MB, GB, TB |
| Angle | deg, rad, grad |
| Radiation | Sv, Gy, Bq, Ci |

> **Note:** This list is illustrative - Exprify supports 100+ individual units spread across these 20 categories, including common SI prefixes (milli-, kilo-, mega-, etc.) where applicable.

## Conversion Syntax

Use the `to` or `in` keyword to convert a value from one unit to another. Both keywords are interchangeable and exist purely for readability - use whichever reads more naturally in context.

```js
expr.evaluate('2 inch to cm');           // 5.08 cm
expr.evaluate('5 cm + 2 inch');          // 10.08 cm
expr.evaluate('100 m/s to km/h');        // 360 km/h
expr.evaluate('1 hour in seconds');      // 3600 s
expr.evaluate('1024 MB to GB');          // 1.024 GB
```

Conversions are only permitted between units that belong to the same category (dimensionally compatible units). Attempting to convert across incompatible categories - for example, converting a length to a weight - raises a descriptive `UnitError` rather than silently returning an incorrect result.

```js
expr.evaluate('5 kg to meters');
// throws UnitError: Cannot convert 'kg' (weight) to 'meters' (length)
```

## Unit-Aware Arithmetic

When you add or subtract two quantities that have different but compatible units, Exprify automatically converts the right-hand operand into the unit of the left-hand operand before performing the operation. The result is expressed in the left operand's unit.

```js
expr.evaluate('5 cm + 2 inch');          // 10.08 cm   (2 inch -> 5.08 cm, then 5 + 5.08)
expr.evaluate('2 inch + 5 cm');          // 3.968... in (5 cm -> 1.968 in, then 2 + 1.968)
expr.evaluate('1 kg - 200 g');           // 0.8 kg
expr.evaluate('1 hour + 30 min');        // 1.5 hour
```

This means the order of operands matters for the *display unit* of the result, though the underlying physical quantity is identical regardless of order.

Multiplication and division follow standard dimensional analysis rules, producing compound units automatically where appropriate:

```js
expr.evaluate('10 m / 2 s');             // 5 m/s
expr.evaluate('5 N * 2 m');              // 10 J
expr.evaluate('60 W * 1 h');             // 60 Wh
```

## Temperature

Temperature is a special case because Celsius and Fahrenheit are *interval* scales rather than *ratio* scales - a direct multiplicative conversion factor doesn't apply the way it does for length or weight. Exprify accounts for this automatically using the correct offset-based formulas.

```js
expr.evaluate('0 C to F');               // 32 F
expr.evaluate('100 C to F');             // 212 F
expr.evaluate('98.6 F to C');            // 37 C
expr.evaluate('273.15 K to C');          // 0 C
```

When adding or subtracting temperature *differences* (deltas) rather than absolute temperatures, be mindful that the offset should not be double-applied. Exprify distinguishes between an absolute temperature reading and a temperature delta based on context, so expressions like `'a temperature rise of 10 C in F'` are interpreted as a 10-unit interval (18 F), not as an absolute-value conversion.

## Compound and Derived Units

Many categories support compound units expressed with `/` and `*`, such as `m/s`, `km/h`, `N*m`, `kg/m^3`, and `W/m²`. These are parsed and converted as a whole, preserving correct dimensional relationships:

```js
expr.evaluate('100 km/h to m/s');        // 27.77... m/s
expr.evaluate('1 kg/m^3 to lb/ft^3');    // 0.0624... lb/ft^3
```

## Error Handling

Exprify aims to fail loudly and clearly rather than guessing. Common error scenarios include:

- **Incompatible categories** - converting between units from different physical dimensions (e.g., length to time).
- **Unknown units** - referencing a unit string that isn't recognized in any category.
- **Ambiguous compound units** - malformed expressions like `'5 m//s'` or mismatched exponents.

In all cases, Exprify throws a typed error with a message describing both the offending unit and the expected category, making it easy to debug at development time or surface a friendly message to end users.

## Tips

- Combine unit conversion with standard arithmetic and variables for powerful expressions, e.g. `expr.evaluate('(distance to km) / (time to h)')` to compute a speed in km/h from arbitrary input units.
- Prefer `to` for explicit "convert this value" semantics and `in` when the expression reads more like a natural-language question (e.g., `'how far is 5 mi in km'`).
- When chaining conversions, only the final `to`/`in` clause determines the output unit - intermediate arithmetic is resolved first using the unit-aware rules above.