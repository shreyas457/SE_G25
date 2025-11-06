// eslint.config.cjs
const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");

module.exports = [
  // Base JS rules
  js.configs.recommended,

  // React rules
  react.configs.recommended,

  // React Hooks rules
  reactHooks.configs.recommended,

  // Project-specific rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["dist", "node_modules"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    plugins: {
      "react-refresh": reactRefresh,
    },

    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/jsx-no-target-blank": "off",
    },

    settings: {
      react: { version: "18.2" },
    },
  },
];
