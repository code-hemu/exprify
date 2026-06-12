// @ts-check
export function createFunctionExecutor(fnRegistry, options = {}) {
  if (!fnRegistry) {
    throw new Error('Function registry is required');
  }

  const config = {
    strict: options.strict ?? true,
  };

  /* ================= EXECUTE ================= */

  function execute(name, args = [], _context) {
    const fn = fnRegistry.get(name);

    /* ----- NOT FOUND ----- */
    if (!fn) {
      if (config.strict) {
        throw new Error(`Unknown function: ${name}`);
      }
      return undefined;
    }

    /* ----- VALIDATE ARGS ----- */
    if (!Array.isArray(args)) {
      throw new Error(`Arguments for "${name}" must be an array`);
    }

    /* ----- EXECUTE ----- */
    try {
      return fn(...args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Error in function "${name}": ${msg}`, { cause: err });
    }
  }

  /* ================= SAFE EXECUTE ================= */

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

  /* ================= EXISTS ================= */

  function exists(name) {
    return fnRegistry.has(name);
  }

  /* ================= API ================= */

  return {
    execute,
    safeExecute,
    exists,
  };
}
