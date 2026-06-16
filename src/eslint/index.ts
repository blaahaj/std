import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import imports from "./imports.js";
import unsafe from "./unsafe.js";
import unused from "./unused.js";

const config = defineConfig(
  {
    files: ["**/*.{js,ts}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },

  {
    rules: {
      "no-constant-condition": "off",
      "no-shadow": "error",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/require-await": "off",
      "object-shorthand": "error",
    },
  },

  imports,
  unsafe,
  unused,
);

export default config;
