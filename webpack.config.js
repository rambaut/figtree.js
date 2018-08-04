const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'figtree.js'),
  output: {
    path: path.resolve(__dirname),
    filename: 'figtree.js'
  },
  externals: [
    'd3'
  ]
}
