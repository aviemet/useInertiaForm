module.exports = {
	preset: 'ts-jest',
	clearMocks: true,
	testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx)'],
	testEnvironment: './fixJestDomEnvironment.ts',
	transform: {
		'^.+\\.tsx?$': ['ts-jest', {
			tsconfig: 'tsconfig.test.json', // Specify the tsconfig file for tests
			diagnostics: {
				warnOnly: true, // Log TypeScript errors as warnings instead of failing tests
			},
		}],
	},
}
