/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],
  // Las pruebas de integración corren en serie para no pisarse en la DB de prueba
  maxWorkers: 1,
  forceExit: true,
  clearMocks: true,
};
