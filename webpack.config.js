const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = [
    {
        cache: false,
        entry: {
            MOLEOnline_View: './sources/src/View/App.tsx',
            MOLEOnline_Init: './sources/src/Init/App.tsx',
        },
        output: {
            filename: '[name]-Core.js?version=R1.1.9.1',
            path: path.resolve(__dirname, 'dist/MoleOnline'),
        },
        devtool: 'source-map',
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    { from: './sources/js/scripts.js', to: () => { return `js/[name][ext]`; } },
                    { from: './sources/js/init-scripts.js', to: () => { return `js/[name][ext]`; } },
                    { from: './sources/css/styles.css', to: () => { return `css/[name][ext]`; } },
                    { from: './sources/css/init-styles.css', to: () => { return `css/[name][ext]`; } },
                    { from: './sources/css/init/*', to: () => { return `css/init/[name][ext]`; } },
                    { from: './sources/fonts/*', to: () => { return `fonts/[name][ext]`; } },
                    { from: './sources/images/*', to: () => { return `images/[name][ext]`; } },
                    { from: './sources/images/front/*', to: () => { return `images/[name][ext]`; } },
                    { from: './sources/html/index.html', to: () => { return `index.html`; } },
                    { from: './sources/html/*', to: () => { return `html/[name][ext]`; }, globOptions: { ignore: ['**/index.html'] } },
                    { from: './sources/config/*', to: () => { return `config/[name][ext]`; } },
                    { from: './sources/templates/*', to: () => { return `html/templates/[name][ext]`; } },
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
                    // use: 'ts-loader',
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
                        // {
                        //     loader: 'ts-loader', // Type checking only
                        //     options: {
                        //         transpileOnly: true, // Disable TypeScript transpilation
                        //     },
                        // }, // Use both Babel and TypeScript loaders
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
