const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = [
    {
        cache: false,
        entry: {
            MOLEonline_View: './sources/src/View/App.tsx',
            MOLEonline_Init: './sources/src/Init/App.tsx',
        },
        output: {
            filename: '[name]-Core.js?version=R1.1.9.2',
            path: path.resolve(__dirname, 'dist/'),
        },
        devtool: 'source-map',
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    { from: './sources/js/scripts.js', to: 'js/scripts.js' },
                    { from: './sources/css/styles.css', to: 'css/styles.css' },
                    { from: './sources/css/Init.css', to: 'css/init-styles.css' },
                    { from: './sources/images/*', to: () => { return `images/[name][ext]`; } },
                    { from: './sources/html/index.html', to: () => { return `index.html`; } },
                    { from: './sources/html/*', to: () => { return `html/[name][ext]`; }, globOptions: { ignore: ['**/index.html'] } },
                    { from: './sources/config/*', to: () => { return `config/[name][ext]`; } },
                    { from: './sources/templates/*', to: () => { return `html/templates/[name][ext]`; } },
                    { from: './static/data/*', to: () => { return `static/[name][ext]`; } },
                ]
            }),
        ],
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.scss', '.css', '.json'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    '@babel/preset-env',
                                    '@babel/preset-react',
                                    '@babel/preset-typescript'
                                ]
                            }
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: ['style-loader', 'css-loader', 'sass-loader'],
                    sideEffects: true,
                },
            ],
        },
    },
]
