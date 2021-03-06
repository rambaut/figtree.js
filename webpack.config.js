const path = require('path');

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname,  'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'figtree.js',
        library:'figtree',
        libraryTarget:'umd'
    },
    externals: [
        'd3'
    ]
};
