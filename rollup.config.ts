import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    banner: "#!/usr/bin/env node",
  },
  plugins: [
    typescript(),
    commonjs(),
    resolve({ preferBuiltins: true }),
    json(),
  ],
  external: ["@actions/core", "@actions/github", "fs/promises"],
};
