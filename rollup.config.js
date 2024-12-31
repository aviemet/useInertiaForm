import external from 'rollup-plugin-peer-deps-external'
import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps'
import terser from '@rollup/plugin-terser'
import filesize from 'rollup-plugin-filesize'
import { dts } from 'rollup-plugin-dts'
import pkg from './package.json'

const externalDeps = [
	'react',
	'react-dom',
	'@inertiajs/core',
	'@inertiajs/react',
	'lodash',
	'axios',
	'react/jsx-runtime',
];

// Base plugins to avoid redundancy
const basePlugins = [
	external(),
	nodeResolve(),
	commonjs(),
	typescript({
		tsconfig: './tsconfig.build.json',
		declarationDir: './dist',
		jsx: 'react-jsx',
		include: ['*.ts+(|x)', '**/*.ts+(|x)'],
		exclude: ['node_modules', 'dist'],
	}),
	sourcemaps(),
	filesize({
		showBrotliSize: true,
		showGzippedSize: true,
	}),
	babel({
		babelHelpers: 'bundled',
		presets: [
			'@babel/preset-react',
			'@babel/preset-typescript',
		],
		extensions: ['.ts', '.tsx'],
		exclude: 'node_modules/**',
	}),
];

export default [
	{
		input: 'src/index.ts',
		output: {
			name: 'useInertiaForm',
			file: pkg.unpkg,
			format: 'umd',
			sourcemap: true,
			globals: {
				'react': 'React',
				'react-dom': 'ReactDOM',
				'@inertiajs/core': '@inertiajs/core',
				'@inertiajs/react': '@inertiajs/react',
				'lodash': '_',
				'axios': 'axios',
				'react/jsx-runtime': 'jsxRuntime',
			},
		},
		plugins: [...basePlugins, terser()],
		external: externalDeps,
	},
	{
		input: 'src/index.ts',
		output: [
			{
				file: pkg.main, // CommonJS
				format: 'es',
				sourcemap: true,
			},
			{
				file: pkg.cjs, // ESM
				format: 'cjs',
				sourcemap: true,
			},
		],
		plugins: basePlugins,
		external: externalDeps,
	},
	{
		input: 'src/index.ts',
		output: [
			{
				file: pkg.types,
				format: 'es',
			},
		],
		plugins: [
			dts({
				compilerOptions: {
					baseUrl: './dist',
				},
			}),
		],
		external: [...externalDeps],
	},
]
