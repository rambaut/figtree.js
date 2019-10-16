import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from "rollup-plugin-terser";

import pkg from './package.json';

export default
	// browser-friendly UMD build
	{
		input: 'index.js',
		output: [
			{name: 'figtree',file: pkg.browser,format: 'umd',sourcemap: true},
			{file: pkg.main,format: 'cjs',sourcemap: true},
			{file: pkg.module,format: 'es' ,sourcemap: true},
			{name: 'figtree',file: pkg.browser.replace(".js",".min.js"),format: 'umd'},
			{file: pkg.main.replace(".js",".min.js"),format: 'cjs'},
			{file: pkg.module.replace(".js",".min.js"),format: 'es'},


		],
		plugins: [
			resolve({
				jsnext: true,
				main: true,
				browser: true
			}), // so Rollup can find `d3`
			babel({
				runtimeHelpers: true,
				exclude: 'node_modules/**',
			}),
			commonjs({include: ['src/*','node_modules/**']}), // so Rollup can convert `d3` to an ES module,
			terser({include: [/^.+\.min\.js$/]})
		]
	};
