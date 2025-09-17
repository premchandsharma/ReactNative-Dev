import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
const pkg = require('./package.json');

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/core.bundle.js',
        format: 'cjs',
        sourcemap: false
    },
    external: [
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.dependencies || {}),
        'react',
        'react-native'
    ],
    plugins: [
        resolve({ preferBuiltins: false }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            declaration: false,            // ignore declarations inside rollup
            emitDeclarationOnly: false     // just transpile for rollup
        }),
        terser()
    ]
};
