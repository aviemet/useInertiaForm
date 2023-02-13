import external from 'rollup-plugin-peer-deps-external'
import ts from 'rollup-plugin-ts'
import commonjs from '@rollup/plugin-commonjs'
import sourcemaps from 'rollup-plugin-sourcemaps'
import terser from '@rollup/plugin-terser';
import filesize from 'rollup-plugin-filesize'
import pkg from './package.json'

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
	},
	{
		input: 'src/index.ts',
		output: [
			{
				file: pkg.main,
				format: 'cjs',
				sourcemap: true,
			},
			{
				file: pkg.module,
				format: 'es',
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
	},
]
