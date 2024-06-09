module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
	},
	'plugins': ['react', '@typescript-eslint', 'import', 'testing-library'],
	'extends': ['plugin:react/recommended', 'plugin:import/typescript', 'plugin:testing-library/react'],
	'settings': {
		'react': {
			'version': 'detect',
		},
		'import/resolver': {
			'typescript': {},
		},
	},
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaFeatures': {
			'jsx': true,
		},
		'ecmaVersion': 'latest',
		'sourceType': 'module',
		'requireConfigFile': false,
	},
	'ignorePatterns': ['dist/*'],
	'rules': {
		'eqeqeq': 'off',

		'indent': 'off',
		'@typescript-eslint/indent': ['error', 'tab', {
			'SwitchCase': 1,
			'VariableDeclarator': 'first',
			'MemberExpression': 1,
			'ArrayExpression': 1,
		}],
		'@typescript-eslint/member-delimiter-style': ['error', {
			'multiline': {
				'delimiter': 'none',
			},
			'singleline': {
				'delimiter': 'comma',
			},
			'multilineDetection': 'brackets',
		}],
		'linebreak-style': ['error', 'unix'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'never'],
		'no-unused-vars': ['warn', {
			'vars': 'all',
			'args': 'none',
		}],
		'no-prototype-builtins': [0],
		'space-infix-ops': ['error'],
		'no-trailing-spaces': 'error',
		'object-curly-spacing': [2, 'always', {
			'objectsInObjects': true,
		}],
		'computed-property-spacing': 2,
		'array-bracket-spacing': 0,
		'brace-style': ['error', '1tbs', {
			'allowSingleLine': true,
		}],
		'react/boolean-prop-naming': ['error'],
		'react/no-typos': ['error'],
		'react/jsx-curly-spacing': ['error', {
			'when': 'always',
			'children': true,
		}],
		'react/display-name': ['off'],
		'react/prop-types': 0,
		'eqeqeq': 'error',
		'no-console': 'warn',
		'eol-last': ['error', 'always'],
		'@typescript-eslint/keyword-spacing': [2, {
			'after': true,
			'before': true,
			'overrides': {
				'if': { 'after': false },
				'for': { 'after': false },
				'while': { 'after': false },
				'switch': { 'after': false },
				'catch': { 'after': false },
			},
		}],
		'comma-dangle': [2, 'always-multiline'],
	},
	overrides: [
		{
			files: ['*.test.ts*'],
			rules: {
				'no-unused-vars': 'off',
			},
		},
	],
}
