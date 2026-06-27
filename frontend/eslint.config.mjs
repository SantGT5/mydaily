import pluginJs from "@eslint/js"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import typescriptParser from "@typescript-eslint/parser"
import eslintConfigPrettier from "eslint-config-prettier"
import i18nextPlugin from "eslint-plugin-i18next"
import prettierPlugin from "eslint-plugin-prettier"
import reactPlugin from "eslint-plugin-react"
import reactHooksPlugin from "eslint-plugin-react-hooks"
import globals from "globals"

export default [
  {
    files: ["src/**/*.{js,jsx,mjs,cjs,mts,ts,tsx}", "vite.config.ts"],
    ignores: [
      "dist/",
      ".idea/",
      "build/",
      ".next/",
      "public/",
      ".vscode/",
      "coverage/",
      "node_modules/",
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "2020",
        ecmaFeatures: { jsx: true },
        tsconfigRootDir: import.meta.dirname,
        project: ["./tsconfig.json", "./tsconfig.app.json", "./tsconfig.node.json"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react: reactPlugin,
      i18next: i18nextPlugin,
      prettier: prettierPlugin,
      "react-hooks": reactHooksPlugin,
      "@typescript-eslint": typescriptEslint,
    },
    settings: { react: { version: "detect" } },
    rules: {
      // Prettier Rules
      "prettier/prettier": "error",

      // TypeScript Rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // React Specific Rules
      "react/prop-types": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General Rules
      "arrow-parens": ["error", "as-needed"],
      "no-console": ["error", { allow: ["warn", "error"] }],

      // i18n Key Validation
      "i18next/no-literal-string": [
        "warn",
        {
          markupOnly: true,
          ignoreAttribute: ["id", "data-testid"],
        },
      ],

      // Padding between statements
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "import", next: "*" },
        { blankLine: "any", prev: "import", next: "import" },
        { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
        {
          blankLine: "any",
          prev: ["const", "let", "var"],
          next: ["const", "let", "var"],
        },
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: ["block", "block-like"], next: "*" },
        { blankLine: "always", prev: "*", next: ["block", "block-like"] },
        { blankLine: "always", prev: "*", next: "function" },
        { blankLine: "always", prev: "function", next: "*" },
      ],
    },
  },

  pluginJs.configs.recommended,
  eslintConfigPrettier,
]
