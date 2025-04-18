import type { Config } from "jest"

const config: Config = {
	preset: "ts-jest",
	clearMocks: true,
	testMatch: ["<rootDir>/tests/**/*.test.(ts|tsx)"],
	testEnvironment: "jest-fixed-jsdom",
	testEnvironmentOptions: {
		customExportConditions: ["node"],
	},
	transform: {
		"^.+\\.tsx?$": ["ts-jest", {
			tsconfig: "tsconfig.test.json",
			diagnostics: {
				warnOnly: true,
			},
		}],
	},
	setupFilesAfterEnv: ["./jest.setup.ts"],
	transformIgnorePatterns: [
		"/node_modules/(?!lodash-es)",
	],
}

export default config
