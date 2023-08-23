// jest.config.js
const nextJest = require('next/jest')
const {pathsToModuleNameMapper} = require('ts-jest')
const {compilerOptions} = require('./tsconfig')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    // Add more setup options before each test is run
    setupFilesAfterEnv: ['<rootDir>/__test__/utils/mockTest.js', '<rootDir>/__test__/utils/mockSSRFetch.js'],
    // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
    moduleDirectories: ['node_modules', '<rootDir>/'],
    testEnvironment: 'jest-environment-jsdom',
    testResultsProcessor: "jest-sonar-reporter",
    modulePaths: [compilerOptions.baseUrl],
    testTimeout: 30000,
    moduleNameMapper: {
        // resolution classique des autres
        ...pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/'})
    }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)