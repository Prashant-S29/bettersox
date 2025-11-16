/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  // Basic formatting
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  useTabs: false,
  trailingComma: "all",
  printWidth: 80,

  // JSX/TSX specific
  jsxSingleQuote: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "always",

  // Tailwind CSS plugin (must be last)
  plugins: ["prettier-plugin-tailwindcss"],

  // File-specific overrides
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
