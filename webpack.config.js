const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';

    return [
        {
            cache: false,
            mode: isProd ? 'production' : 'development',
            entry: {
                MOLEonline_View: './sources/src/View/App.tsx',
                MOLEonline_Init: './sources/src/Init/App.tsx',
            },
            output: {
                filename: '[name]-Core.js?version=R1.1.9.4',
                path: path.resolve(__dirname, 'dist/'),
            },
            devtool: isProd ? false : 'source-map',
            plugins: [
                new CopyWebpackPlugin({
                    patterns: [
                        { from: './sources/js/scripts.js', to: 'js/scripts.js' },
                        { from: './sources/css/styles.css', to: 'css/styles.css' },
                        { from: './sources/css/Init.css', to: 'css/init-styles.css' },
                        { from: './sources/images/*', to: () => `images/[name][ext]` },
                                      { from: './sources/html/index.html', to: () => `index.html` },
                                      {
                                          from: './sources/html/*',
                                          to: () => `html/[name][ext]`,
                                      globOptions: { ignore: ['**/index.html'] },
                                      },
                                      { from: './sources/config/*', to: () => `config/[name][ext]` },
                                      { from: './sources/templates/*', to: () => `html/templates/[name][ext]` },
                                      { from: './static/data/*', to: () => `static/[name][ext]` },
                    ],
                }),
            ],
            resolve: {
                extensions: ['.tsx', '.ts', '.js', '.scss', '.css', '.json'],
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                            },
                        },
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.scss$/,
                        use: ['style-loader', 'css-loader', 'sass-loader'],
                        sideEffects: true,
                    },
                ],
            },
        },
    ];
};
