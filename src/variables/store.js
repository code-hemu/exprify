const validVarName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export function createVarStore(initial = {}) {
  let store = Object.create(null);

  for (const key in initial) {
    store[key] = initial[key];
  }

  return {
    /**
     * @param {string} name
     * @param {number | undefined} value
     */
    set(name, value, { override = true } = {}) {
      if (typeof name !== 'string' || !name) {
        throw new Error('Variable name must be a non-empty string');
      }

      if (!validVarName.test(name)) {
        throw new Error(`Variable Name Error: '${name}' is not a valid variable name`);
      }

      // Value validation
      if (value === undefined) {
        throw new Error(`Variable Value Error: '${name}' cannot be undefined`);
      }

      // Prevent overwrite (optional)
      if (!override && name in store) {
        throw new Error(`Variable '${name}' already exists`);
      }

      store[name] = value;
    },

    /**
     * @param {string | number} name
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
      store = Object.create(null);
    },

    merge(obj = {}) {
      for (const key in obj) {
        store[key] = obj[key];
      }
    },

    clone() {
      return createVarStore(store);
    },
  };
}

export default { createVarStore };
