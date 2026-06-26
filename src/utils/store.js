import { findDerivedRule } from './units.js';

export function createUnitsStore(initial = {}) {
  let units = { ...initial };

  // Helpers
  function getAllUnitsFlat() {
    const result = new Set();

    for (const type in units) {
      for (const key in units[type]) {
        const u = units[type][key];

        const keyLower = key.toLowerCase();
        result.add(keyLower);

        // Unit name
        if (u.unit) {
          const unitLower = u.unit.toLowerCase();

          // Avoid duplicate like "m" vs "meter"
          if (unitLower !== keyLower) {
            if (unitLower.split(/\s+/).length === 1) {
              result.add(unitLower);
            }
          }
        }

        // Symbol
        if (u.symbol) {
          const symbolLower = u.symbol.toLowerCase();

          // Avoid duplicate with unit name
          if (!u.unit || symbolLower !== u.unit.toLowerCase()) {
            result.add(symbolLower);
          }
        }
      }
    }

    return Array.from(result);
  }

  /**
   * @param {string} input
   * @param {string|null} [relatedType]
   */
  function findUnit(input, relatedType = null) {
    input = input.toLowerCase();
    let firstMatch = null;

    for (const type in units) {
      for (const key in units[type]) {
        const u = units[type][key];

        if (
          key.toLowerCase() === input ||
          u.unit?.toLowerCase() === input ||
          u.symbol?.toLowerCase() === input
        ) {
          if (type === relatedType) {
            return { type, key, data: u };
          }
          if (!firstMatch) {
            firstMatch = { type, key, data: u };
          }
        }
      }
    }

    return firstMatch;
  }

  /**
   * @param {number} value
   * @param {any} fromUnit
   * @param {any} toUnit
   */
  function convert(value, fromUnit, toUnit) {
    const to = findUnit(toUnit);
    const from = findUnit(fromUnit, to?.type || null);

    if (!from) {
      throw new Error(`Unknown unit: ${fromUnit}`);
    }
    if (!to) {
      throw new Error(`Unknown unit: ${toUnit}`);
    }

    if (from.type !== to.type) {
      throw new Error(
        `Cannot convert ${fromUnit} to ${toUnit} (${to.data.unit || to.key}). ${from.data.unit || from.key} conversion units like ${Object.keys(units[from.type]).join(', ')}`
      );
    }

    let result;

    if (from.type === 'temperature') {
      // Convert to Kelvin first, then to target
      let kelvin = 0;
      if (from.key === 'K') kelvin = value;
      else if (from.key === 'C') kelvin = value + 273.15;
      else if (from.key === 'F') kelvin = (value - 32) * (5 / 9) + 273.15;
      else throw new Error(`Unsupported temperature unit: ${from.key}`);

      if (to.key === 'K') result = kelvin;
      else if (to.key === 'C') result = kelvin - 273.15;
      else if (to.key === 'F') result = (kelvin - 273.15) * (9 / 5) + 32;
      else throw new Error(`Unsupported temperature unit: ${to.key}`);
    } else {
      result = value * (from.data.value / to.data.value);
    }

    return { value: result, unit: to.key };
  }

  // Public API
  return {
    // Get all units
    getUnits: () => units,

    setUnits: (/** @type {{}} */ newUnits) => {
      units = { ...newUnits };
    },

    updateType: (/** @type {string | number} */ type, /** @type {any} */ data) => {
      units[type] = { ...units[type], ...data };
    },

    addUnit: (
      /** @type {string | number} */ type,
      /** @type {string | number} */ key,
      /** @type {any} */ unitObj
    ) => {
      if (!units[type]) {
        units[type] = {};
      }
      units[type][key] = unitObj;
    },
    // Unit-aware arithmetic: unify operands to same unit type, then apply operator
    /**
     * @param {string} op
     * @param {{ unit: any; value: any; }} left
     * @param {{ unit: any; value: number; }} right
     */
    compute(op, left, right) {
      const isUnit = (/** @type {any} */ v) =>
        v && typeof v === 'object' && 'value' in v && 'unit' in v;

      const apply = (/** @type {any} */ a, /** @type {any} */ b) => {
        switch (op) {
          case '+':
            return a + b;
          case '-':
            return a - b;
          case '*':
            return a * b;
          case '/':
            return a / b;
          case '%':
            return a % b;
          case '^':
            return Math.pow(a, b);
        }
      };

      // BOTH UNIT
      if (isUnit(left) && isUnit(right)) {
        let from = this.findUnit(right.unit);
        let to = this.findUnit(left.unit);

        if (from && to && from.type !== to.type) {
          const f2 = this.findUnit(right.unit, to.type);
          const t2 = this.findUnit(left.unit, from.type);
          if (f2 && t2 && f2.type === t2.type) {
            from = f2;
            to = t2;
          }
        }

        if (from && to && (op === '*' || op === '/')) {
          const rule = findDerivedRule(to.type, from.type, op);
          if (rule) {
            const leftBase = left.value * to.data.value;
            const rightBase = right.value * from.data.value;
            const resultBase = op === '*' ? leftBase * rightBase : leftBase / rightBase;
            const resultUnit = this.findUnit(rule.resultKey);
            if (resultUnit) {
              return { value: resultBase / resultUnit.data.value, unit: rule.resultKey };
            }
          }
        }

        if (!from || !to || from.type !== to.type) {
          throw new Error(`Cannot operate on different unit types`);
        }

        // convert right → left unit
        const r = right.value * (from.data.value / to.data.value);

        const result = apply(left.value, r);

        // multiplication/division produce compound units
        if (op === '*') {
          return { value: result, unit: left.unit };
        }

        if (op === '/') {
          return { value: result, unit: left.unit };
        }

        if (op === '^') {
          return { value: result, unit: left.unit };
        }

        return { value: result, unit: left.unit };
      }

      // LEFT UNIT
      if (isUnit(left) && !isUnit(right)) {
        const result = apply(left.value, right);

        return { value: result, unit: left.unit };
      }

      // RIGHT UNIT
      if (!isUnit(left) && isUnit(right)) {
        const result = apply(left, right.value);

        if (op === '/') {
          return { value: result, unit: right.unit };
        }

        return { value: result, unit: right.unit };
      }

      // NORMAL
      return apply(left, right);
    },

    convert,

    // Search helpers
    getAllUnitsFlat,
    findUnit,
  };
}
