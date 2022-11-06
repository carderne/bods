module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["prettier", "import"],
  rules: {
    "import/extensions": [0, { "<js>": "always" }],
    quotes: [2, "double"],
    "object-shorthand": "off",
    "func-names": ["error", "never"],
  },
};
