import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", ".rfq-test-build/**", ".whatsapp-test-build/**", ".cms-test-build/**", ".commerce-test-build/**", ".checkout-test-build/**", ".storefront-test-build/**", "src/migrations/**", "out/**", "build/**", "next-env.d.ts"]),
]);
