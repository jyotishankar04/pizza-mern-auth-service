const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    collectCoverage: true,
    coverageProvider: "v8",
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!**/node_modules/**",
        "!**/test/**",
        "!**/dist/**",
    ],
};
