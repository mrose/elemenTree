import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import fs from "fs";
import pkg from "./package.json";

const ch = (function () {
  let n = "";
  const re = /^(\w){7}/g;
  try {
    n = fs.readFileSync(".commithash", "utf-8");
  } catch (err) {
    n = "unknown";
  }
  return n.match(re);
})();

const now = new Date(new Date().getTime()).toUTCString();
const yrnow = new Date(new Date().getTime()).getFullYear();

const banner = `/**
* @license
*	elementree
*	https://github.com/mrose/elementree
*	© ${yrnow} Mitchell Rose
* version ${pkg.version}
* commit ${ch}
* built ${now}
*	released under the MIT License
*/`;

export default [
  // browser-friendly UMD builds
  {
    input: "src/index.js",
    output: {
      file: "dist/index.js",
      format: "umd",
      name: "index",
      banner,
    },
    plugins: [
      nodeResolve(), // so Rollup can find `lodash`
      commonjs(), // so Rollup can convert `lodash` to an ES module
    ],
  },
  {
    input: "src/index.js",
    output: {
      file: pkg.browser,
      format: "umd",
      name: "elementree",
      banner,
    },
    plugins: [
      nodeResolve(), // so Rollup can find `lodash`
      commonjs(), // so Rollup can convert `lodash` to an ES module
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: "src/index.js",
    output: [
      { banner, name: "elementree", file: pkg.main, format: "cjs" },
      { banner, name: "elementree", file: pkg.module, format: "es" },
    ],
    plugins: [
      nodeResolve(), // so Rollup can find `lodash`
      commonjs(), // so Rollup can convert `lodash` to an ES module
    ],
  },
];
