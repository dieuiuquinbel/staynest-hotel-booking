module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
  globalSetup: "<rootDir>/tests/globalSetup.js",
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
};
