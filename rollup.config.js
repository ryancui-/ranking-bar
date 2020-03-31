import typescript from 'rollup-plugin-typescript'

export default {
  input: './src/main.ts',
  plugins: [
    typescript({
      exclude: 'node_modules/**',
      typescript: require('typescript')
    })
  ],
  output: [{
    format: 'cjs',
    file: 'lib/index.cjs.js'
  }, {
    format: 'es',
    file: 'lib/index.esm.js'
  }]
}
