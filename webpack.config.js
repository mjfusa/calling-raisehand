const webpack = require('webpack');
const path = require('path');
const DotenvPlugin = require('dotenv-webpack');

module.exports = {
    mode: 'development',
    entry: './index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, './')
        },
    }
    ,
    plugins: [
        new DotenvPlugin({
            path: './.env'
        })
    ]
};