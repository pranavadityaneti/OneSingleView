import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                fetch: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                FormData: "readonly",
                Blob: "readonly",
                File: "readonly",
                Request: "readonly",
                Response: "readonly",
                Headers: "readonly",
                AbortController: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                Promise: "readonly",
                Map: "readonly",
                Set: "readonly",
                process: "readonly",
            },
        },
        rules: {
            "no-unused-vars": "warn",
        },
        ignores: [".next/**", "node_modules/**"],
    },
];
