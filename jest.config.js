module.exports = {
  "preset": "ts-jest",
  "silent": false,
  "verbose": true,
  "maxWorkers": "50%",
  "testEnvironment": "node",
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "testPathIgnorePatterns": ["/node_modules/", "\\.ts$"],
};
