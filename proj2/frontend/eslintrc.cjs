// eslint.config.cjs
const js = require("@eslint/js");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");

module.exports = [
  js.configs.recommended,
  react.configs.recommended,
  reactHooks.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    plugins: { reactRefresh },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
    settings: { react: { version: "18.2" } },
    ignores: ["dist"],
  },
];
