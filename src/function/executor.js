/**
 * @param {{ get: (arg0: any) => any; has: (arg0: any) => any; }} fnRegistry
 */
export function createFunctionExecutor(fnRegistry, options = {}) {
  if (!fnRegistry) {
    throw new Error('Function registry is required');
  }

  const config = {
    strict: options.strict ?? true,
  };

  /**
   * @param {any} name
   * @param {any} args
   * @param {any} _context
   */
  function execute(name, args = [], _context) {
    const fn = fnRegistry.get(name);

    // not found
    if (!fn) {
      if (config.strict) {
        throw new Error(`Unknown function: ${name}`);
      }
      return undefined;
    }

    // validate args
    if (!Array.isArray(args)) {
      throw new Error(`Arguments for "${name}" must be an array`);
    }

    // execute
    try {
      return fn(...args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Error in function "${name}": ${msg}`, { cause: err });
    }
  }

  /**
   * @param {any} name
   * @param {any} args
   * @param {any} context
   */
  function safeExecute(name, args = [], context) {
    try {
      return execute(name, args, context);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        error: true,
        message: msg,
      };
    }
  }

  /**
   * @param {any} name
   */
  function exists(name) {
    return fnRegistry.has(name);
  }

  // API
  return {
    execute,
    safeExecute,
    exists,
  };
}
