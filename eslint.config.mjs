import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import parser from "@typescript-eslint/parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
    {
        ignores: ["dist", "node_modules", "eslint.config.mjs"],
    },

    // Base config for JS (non-TS files)
    {
        ...eslint.configs.recommended,
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                require: "readonly",
                module: "readonly",
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
            },
        },
    },

    // TypeScript rules applied only to .ts files
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser, // ✅ This fixes the "Unexpected token" issue
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
        },
        rules: {
            ...tseslint.configs.recommendedTypeChecked[0].rules,
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
];
