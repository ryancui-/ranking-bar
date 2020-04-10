import typescript from 'rollup-plugin-typescript'
import { terser } from "rollup-plugin-terser"

export default {
  input: './src/main.ts',
  plugins: [
    typescript({
      exclude: 'node_modules/**',
      typescript: require('typescript')
    }),
    terser()
  ],
  output: [{
    format: 'cjs',
    file: 'lib/index.cjs.js'
  }, {
    format: 'es',
    file: 'lib/index.esm.js'
  }, {
    format: 'umd',
    file: 'lib/index.umd.js',
    name: 'RankingBar'
  }]
}
