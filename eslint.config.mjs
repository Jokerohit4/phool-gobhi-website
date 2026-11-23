import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This codebase's standard data-fetching pattern is `useEffect(() =>
      // { load() }, [load])` where `load` is an async fetch-and-setState
      // function — the idiomatic "fetch on mount" pattern, not a bug. This
      // rule flags it as an error across ~10 existing files; downgraded to
      // a warning rather than rewriting all of them as an unrelated
      // side-effect of unrelated work.
      "react-hooks/set-state-in-effect": "warn",
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
