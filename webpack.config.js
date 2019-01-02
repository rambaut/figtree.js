const path = require('path');

module.exports = {
    mode: 'development',
    entry: path.resolve(__dirname, 'src', 'tree.mjs'),
    output: {
        path: path.resolve(__dirname, 'js'),
        filename: 'figtree.mjs'
    },
    externals: [
        'd3'
    ]
};
