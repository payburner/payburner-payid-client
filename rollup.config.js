import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'
import json from '@rollup/plugin-json'
// delete old typings to avoid issues
require('fs').unlink('dist/index.d.ts', (err) => {});

export default {
    input: 'src/index.ts',
    external: [ ],
    output: [
        {
            file: pkg.main,
            format: 'cjs'
        },
        {
            file: pkg.module,
            format: 'es'
        },
        {
            file: pkg.browser,
            format: 'iife',
            name: 'Payburner'
        }

    ],
    plugins: [
        typescript({
            typescript: require('typescript'),
        }),

        resolve(),
        commonJS( ),
        json(),
        globals(),
        builtins()
    ]
};