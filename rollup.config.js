import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'index.js',
		output: {
			name: 'figtree',
			file: pkg.browser,
			format: 'umd',
			sourcemap: true,

		},
		plugins: [
			resolve({
				jsnext: true,
				main: true,
				browser: true
			}), // so Rollup can find `d3`
			commonjs({include: ['src/*','node_modules/**']}) // so Rollup can convert `d3` to an ES module
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input: 'index.js',
		output: [
			{	file: pkg.main,
				format: 'cjs',
				sourcemap: true
			},
			{
				file: pkg.module,
				format: 'es' ,
				sourcemap: true
			}],
		plugins: [
			resolve({
				jsnext: true,
				main: true,
				browser: true
			}), // so Rollup can find `d3`
			commonjs({include: ['src/*','node_modules/**']}) // so Rollup can convert `d3` to an ES module
		]
	}
];