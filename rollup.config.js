import external from 'rollup-plugin-peer-deps-external'
import ts from 'rollup-plugin-ts'
import commonjs from '@rollup/plugin-commonjs'
import sourcemaps from 'rollup-plugin-sourcemaps'
import terser from '@rollup/plugin-terser'
import filesize from 'rollup-plugin-filesize'
import pkg from './package.json'

const externalDeps = ['@inertiajs/core', '@inertiajs/react', 'react', 'lodash', 'axios']

export default [
	{
		input: 'src/index.ts',
		output: {
			name: 'useInertiaForm',
			file: pkg.unpkg,
			format: 'umd',
			sourcemap: true,
			globals: {
				react: 'React',
				'@inertiajs/core': '@inertiajs/core',
				'@inertiajs/react': '@inertiajs/react',
				'lodash': '_',
				'axios': 'axios',
			},
		},
		plugins: [
			external(),
			ts(),
			commonjs(),
			sourcemaps(),
			terser(),
			filesize(),
		],
		external: externalDeps,
	},
	{
		input: 'src/index.ts',
		output: [
			{
				file: pkg.main,
				format: 'es',
				sourcemap: true,
			},
			{
				file: pkg.cjs,
				format: 'cjs',
				sourcemap: true,
			},
		],
		plugins: [
			external(),
			ts(),
			commonjs(),
			sourcemaps(),
			terser(),
			filesize(),
		],
		external: externalDeps,
	},
]
