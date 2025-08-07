import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import parser from "@typescript-eslint/parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
    {
        ignores: ["dist", "node_modules", "eslint.config.mjs",".github", "test"],
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
        rules: {
            "no-unused-vars": "warn", // Basic JS unused vars
        },
    },

    // TypeScript rules applied only to .ts files
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser,
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
            "no-unused-vars": "off", // Disable base rule
            "@typescript-eslint/no-unused-vars": [
                "warn", // or "error"
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            // Other TypeScript specific rules
        },
    },
];
