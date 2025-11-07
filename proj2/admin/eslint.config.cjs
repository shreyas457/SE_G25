// eslint.config.cjs
const reactRefresh = require("eslint-plugin-react-refresh");

module.exports = [
  {
    root: true,
    files: ["**/*.{js,jsx}"],
    ignores: ["dist", ".eslintrc.cjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: { react: { version: "18.2" } },
    env: { browser: true, es2020: true },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react/jsx-runtime",
      "plugin:react-hooks/recommended",
    ],
  },
];