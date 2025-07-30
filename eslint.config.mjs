import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        files: ["src/**/*.ts"], // ✅ only lint .ts in src
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },
    },
    // ✅ ignore dist and node_modules
    {
        ignores: [
            "dist",
            "node_modules",
            "eslint.config.mjs", // ✅ make sure config is ignored
        ],
    },
    // Rules
    {
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
);
