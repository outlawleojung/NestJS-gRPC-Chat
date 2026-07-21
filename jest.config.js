/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@app/common(|/.*)$': '<rootDir>/libs/common/src$1',
    '^@app/entity(|/.*)$': '<rootDir>/libs/entity/src$1',
    '^@app/grpc(|/.*)$': '<rootDir>/libs/grpc/src$1',
    '^@app/nats(|/.*)$': '<rootDir>/libs/nats/src$1',
    '^@app/redis(|/.*)$': '<rootDir>/libs/redis/src$1',
    '^@app/repository(|/.*)$': '<rootDir>/libs/repository/src$1',
  },
  collectCoverageFrom: ['apps/**/*.ts', 'libs/**/*.ts', '!**/*.spec.ts', '!**/main.ts'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
