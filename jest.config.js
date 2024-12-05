module.exports = {
	preset: 'ts-jest',
	clearMocks: true,
	testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx)'],
	// testEnvironment: './fixJestDomEnvironment.ts',
	testEnvironment: 'jest-fixed-jsdom',
	testEnvironmentOptions: {
		customExportConditions: ['node'],
	},
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			tsconfig: 'tsconfig.test.json',
			diagnostics: {
				warnOnly: true,
			},
		}],
	},
}
