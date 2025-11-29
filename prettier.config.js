/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  trailingComma: "all",
  printWidth: 80,

  jsxSingleQuote: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",

  plugins: ["prettier-plugin-tailwindcss"],

  overrides: [
    {
      files: "*.json",
      options: {
        printWidth: 120,
      },
    },
  ],
};

export default config;
