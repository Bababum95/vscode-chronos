import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "out/**",
      "*.min.js",
      "*.min.css",
      "webpack.config.js",
      "*.config.js",
      "*.config.mjs",
      "package-lock.json",
      "yarn.lock",
      ".git/**",
      ".vscode/**",
      "images/**",
      "*.png",
      "*.jpg",
      "*.jpeg",
      "*.gif",
      "*.svg"
    ]
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },

    rules: {
      // TypeScript specific rules
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],

      // Code quality rules
      curly: "off",
      eqeqeq: "warn",
      "no-throw-literal": "warn",
      semi: "warn",
      "no-unused-vars": "warn",
      "no-console": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-template": "warn",
      "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 1 }],
      "max-len": ["error", { "code": 100, "ignoreUrls": true, "ignoreStrings": true, "ignoreTemplateLiterals": true }],

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
