export function createFunctionRegistry(initial = {}) {
  // Object.create(null) avoids prototype pollution (no inherited properties)
  const store = Object.create(null);

  for (const key in initial) {
    if (typeof initial[key] === 'function') {
      store[key] = initial[key];
    }
  }

  return {
    getAllFunctionsName() {
      return Object.keys(store);
    },

    /**
     * @param {string} name
     * @param {any} fn
     */
    register(name, fn) {
      if (typeof name !== 'string' || !name) {
        throw new Error('Formula name must be a non-empty string');
      }

      if (typeof fn !== 'function') {
        throw new Error(`Formula "${name}" must be callable`);
      }

      store[name] = fn;
    },

    /**
     * @param {string} name
     */
    get(name) {
      return store[name];
    },

    /**
     * @param {any} name
     */
    has(name) {
      return Object.prototype.hasOwnProperty.call(store, name);
    },

    /**
     * @param {string | number} name
     */
    remove(name) {
      delete store[name];
    },

    all() {
      return { ...store };
    },

    clear() {
      for (const key in store) {
        delete store[key];
      }
    },

    extend(formulas = {}) {
      for (const name in formulas) {
        if (typeof formulas[name] === 'function') {
          store[name] = formulas[name];
        }
      }
    },

    clone() {
      return createFunctionRegistry(store);
    },
  };
}
