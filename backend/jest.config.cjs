module.exports = {
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: [
    '**/*.ts',
    '!main.ts',
    '!**/*.module.ts',
    '!**/dto/**',
  ],
  coverageDirectory: '../coverage',
};
