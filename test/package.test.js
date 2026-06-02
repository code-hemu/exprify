import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const pkg = JSON.parse(
  readFileSync(resolve(repoRoot, "package.json"), "utf8")
);
const cjsPath = resolve(repoRoot, pkg.exports?.["."]?.require ?? pkg.main);
const esmPath = resolve(repoRoot, pkg.exports?.["."]?.import ?? pkg.module);
const cjsRel = cjsPath.slice(repoRoot.length + 1).replace(/\\/g, "/");
const esmRel = esmPath.slice(repoRoot.length + 1).replace(/\\/g, "/");

describe("Package layout - ESM/CJS interop", () => {
  test("package.json declares both 'import' and 'require' conditions", () => {
    expect(pkg.exports).toBeDefined();
    expect(pkg.exports["."]).toBeDefined();
    expect(pkg.exports["."].import).toBe("./dist/exprify.esm.js");
    expect(pkg.exports["."].require).toBe("./dist/exprify.cjs.cjs");
  });

  test("CJS entry uses .cjs extension so it is not broken by \"type\": \"module\"", () => {
    expect(cjsRel.endsWith(".cjs")).toBe(true);
    expect(cjsRel).not.toMatch(/\.cjs\.js$/);
  });

  test("ESM and CJS bundles referenced by exports exist on disk", () => {
    expect(existsSync(esmPath)).toBe(true);
    expect(existsSync(cjsPath)).toBe(true);
  });

  test("CJS bundle is loadable via require() and exports the Exprify class", () => {
    const req = createRequire(import.meta.url);
    const required = req(cjsPath);
    expect(required).toBeDefined();
    expect(typeof required).toBe("function");
    expect(new required().evaluate("2 + 3")).toBe(5);
  });

  test("ESM bundle is loadable via dynamic import() with a default export", async () => {
    const mod = await import(pathToFileURL(esmPath).href);
    expect(mod).toBeDefined();
    expect(typeof mod.default).toBe("function");
    expect(new mod.default().evaluate("2 + 3")).toBe(5);
  });

  test("CJS bundle source uses module.exports (not ESM export)", () => {
    const source = readFileSync(cjsPath, "utf8");
    expect(source).toMatch(/module\.exports\s*=\s*exprify/);
    expect(source).not.toMatch(/^export\s+/m);
  });

  test("ESM bundle source uses a default export", () => {
    const source = readFileSync(esmPath, "utf8");
    expect(source).toMatch(/export\s*\{\s*exprify\s+as\s+default\s*\}/);
  });
});
