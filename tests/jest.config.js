const path = require('path');
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig');

const rootDir = path.resolve(__dirname, '..');

const baseConfig = createJestConfig(
  (relativePath) => path.resolve(rootDir, relativePath),
  rootDir,
  false
);

module.exports = {
  ...baseConfig,
  testMatch: [
    '<rootDir>/src/**/*.(spec|test).(ts|tsx|js|jsx)'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/react-scripts/config/jest/babelTransform.js',
    '^.+\\.css$': '<rootDir>/node_modules/react-scripts/config/jest/cssTransform.js',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/node_modules/react-scripts/config/jest/fileTransform.js'
  },
  watchPlugins: []
};
