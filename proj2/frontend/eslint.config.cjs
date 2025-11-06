// eslint.config.cjs
const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");

module.exports = [
  // Base JS recommended rules
  js.configs.recommended,

  // React recommended rules
  react.configs.recommended,

  // React Hooks recommended rules
  reactHooks.configs.recommended,

  // Project-specific overrides
  {
    files: ["**/*.{js,jsx,ts,tsx}"], // all JS/TS files
    ignores: ["dist", "node_modules"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },

    // Plugins must be objects in flat config
    plugins: {
      "react-refresh": reactRefresh,
    },

    rules: {
      // Fast Refresh: only export React components
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // Optional React rules
      "react/jsx-no-target-blank": "off",
      // Add more project-specific rules here if needed
    },

    settings: {
      react: { version: "18.2" },
    },
  },
];
