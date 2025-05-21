module.exports = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.json$/,
                type: 'json',
                loader: 'json-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|webp)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'snapshots/[name][ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
    }
};
