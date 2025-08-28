import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: ["coverage/", ".next/", ".scripts/"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Reduz ruído em fase de migração; manteremos como aviso
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": ["warn"],
    },
  },
  // Relax rules for scripts JS files (allow require-style imports)
  {
    files: ["scripts/**/*.js", ".scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    },
  },
  // Keep a looser set for mixed test folders and scripts
  {
    files: ["src/tests/**/*.{js,ts,tsx}", "scripts/**/*.{js,ts}", ".scripts/**/*.{js,ts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  // Reduce strictness for type definition files and tests to avoid noise
  {
    files: ["src/types/**/*.ts", "**/*.test.{ts,tsx}", "src/**/__tests__/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-empty-object-type": "off"
    },
  },
];

export default eslintConfig;
