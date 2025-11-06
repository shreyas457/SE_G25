// eslint.config.cjs
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  react.configs.recommended,
  reactHooks.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    plugins: { "react-refresh": reactRefresh }, // <-- object format
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react/jsx-no-target-blank": "off"
    },
    settings: { react: { version: "18.2" } },
    ignores: ["dist"],
  },
];
