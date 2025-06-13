import type {JestConfigWithTsJest} from 'ts-jest';
import {pathsToModuleNameMapper} from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest/presets/default-esm',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  extensionsToTreatAsEsm: ['.ts'],
  testTimeout: 500000, // Set to a higher value for debug
  moduleNameMapper: {
    // https://github.com/kulshekhar/ts-jest/issues/1057#issuecomment-1303376233
    '^(\\.{1,2}/.*)\\.[jt]s$': '$1',
    ...pathsToModuleNameMapper({
        "@/api/*": ["./src/core/api/*"],
        "@/services/*": ["./src/core/services/*"],
        "@/*": ["./src/*"]
      }, {
      prefix: `<rootDir>/`,
      useESM: true,
    }),
  },
};

export default jestConfig;
