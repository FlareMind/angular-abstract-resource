let webpack = require('webpack'),
    path = require('path');


module.exports = {
    entry: 'mocha-loader!./test/index.js',

    output: {
        filename: 'bundle.test.js',
        path: path.resolve(__dirname, 'test/')
    },

    devServer: {
        port: 80,
        historyApiFallback: {
            index: 'mocha.html'
        }
    },

    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }]
        }, {
            test: /\.ts$/,
            exclude: /(node_modules|bower_components)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            },
                'ts-loader'
            ]
        }, {
            /*
             * Angular does not support CommonJS. Fix with export-loader. See
             * https://github.com/webpack/webpack/issues/2049
             */
            test: require.resolve('angular'),
            loader: 'exports-loader?window.angular'
        }]
    },

    plugins: [
        new webpack.ProvidePlugin({
            'angular': 'angular'
        })
    ],

    resolve: {
        extensions: ['.ts', '.js', '.json']
    }
};
