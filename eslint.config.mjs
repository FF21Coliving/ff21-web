import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Links come from @/components/link, which prefetches only on hover or
  // touch (Vercel request count, 20 Nov 2026).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/link.tsx"],
    rules: {
      "no-restricted-imports": ["error", { paths: [{ name: "next/link", message: "Import Link from \"@/components/link\" instead: it prefetches only on hover or touch." }] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
