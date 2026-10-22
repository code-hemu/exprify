import dts from "@guchho/dts";
import banner from "@guchho/banner";


const sharedOutputOptions = {
  entry: "src/index.js",
  target: "esnext",
  bundle: true,
  sourcemap: true,
  treeShaking: true,
  exports: "default"
}

export default [
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/exprify.esm.js",
      format: "esm",
      minify: false,
      define: { __DEV__: 'true' }
    },
    plugins: [
      banner({
        style: "long",
        packageJson: "./package.json",
      }),
      dts({
        entry: ".types/index.d.ts",
        outfile: "dist/index.d.ts",
        respectExternal: true
      })
    ]
  },
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/exprify.cjs.cjs",
      format: "cjs",
      minify: false,
      define: { __DEV__: 'true' }
    },
    plugins: [
      banner({
        style: "long",
        packageJson: "./package.json",
      })
    ]
  },
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/exprify.js",
      name: "Exprify",
      format: "umd",
      minify: false,
      define: { __DEV__: 'true' }
    },
    plugins: [
      banner({
        style: "long",
        packageJson: "./package.json",
      })
    ]
  },
  {
    build: {
      ...sharedOutputOptions,
      outfile: "dist/exprify.min.js",
      name: "Exprify",
      format: "umd",
      minify: true,
      define: { __DEV__: 'false' }
    },
    plugins: [
      banner({
        style: "short",
        packageJson: "./package.json",
      })
    ]
  }
];
