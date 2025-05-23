/** @type {import("jest").Config} **/
export default {
  displayName: 'stVaults CLI tests',
  testEnvironment: "node",
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        module: "ESNext",
        moduleResolution: "NodeNext",
      }
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(viem|@viem)/)'
  ],
};
