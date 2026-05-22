// =============================================================================
// ESLint flat config — production-grade linting for the client + server
// =============================================================================
// Rules enforce: no `any`, no unused vars (with `_` ignore convention),
// React Hooks correctness, fast refresh boundaries, and consistent imports.
// =============================================================================

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "build/**",
      "node_modules/**",
      "client/public/**",
      "**/*.min.js",
      ".manus-logs/**",
      "patches/**",
    ],
  },

  // ---- Base TypeScript / TSX --------------------------------------------------
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      eqeqeq: ["error", "smart"],
      curly: ["error", "multi-line"],
    },
  },

  // ---- React (client) ---------------------------------------------------------
  // We deliberately only enable the two "classic" react-hooks rules. The newer
  // `react-hooks/recommended` (v6+) adds React Compiler rules — useful in a
  // greenfield app, but they fire on every shadcn/ui component and a few
  // pre-existing patterns we don't want to refactor in this PR.
  {
    files: ["client/src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // ---- Generated / vendored code (shadcn/ui + Manus debug plugin) ------------
  // shadcn/ui ships pre-formed components with intentional `any` casts and
  // dual-export patterns (constants + components). These files are vendored,
  // not authored by us; we suppress the relevant rules instead of fork-editing.
  {
    files: [
      "client/src/components/ui/**/*.{ts,tsx}",
      "client/src/components/ManusDialog.tsx",
      "vite.config.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-refresh/only-export-components": "off",
    },
  },

  // ---- Config files (allow Node globals, no React rules) ---------------------
  {
    files: ["*.config.{ts,js,mjs}", "vite.config.ts", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },

  // ---- Server -----------------------------------------------------------------
  {
    files: ["server/**/*.ts"],
    languageOptions: { globals: globals.node },
    rules: {
      "no-console": "off",
    },
  },
);
