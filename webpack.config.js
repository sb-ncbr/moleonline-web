// webpack.config.js
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const sass = require('sass');

// Legacy global scripts, concatenated in this order into js/scripts.js
const legacyScripts = [
    'datagrid.js',
    'Palette.js',
    'tabsConfig.js',
];

// Stylesheets concatenated in this order into css/styles.css (.scss files are compiled first)
const stylesheets = [
    'AglomeredParameters.css',
    'AlertMessages.css',
    'annotate.css',
    'ChannelParameters.css',
    'CofactorPickBox.css',
    'Components.css',
    'Controls.css',
    'CSAPickBox.css',
    'datagrid.css',
    'DownloadReport.css',
    'StartingPoints.css',
    'LayerVizualizerStyles.css',
    'lining-residues.css',
    'LoadingScreen.css',
    'pdbid.css',
    'PDFReportGenerator.css',
    'QuickHelp.css',
    'SequenceViewer.css',
    'style.css',
    'tabs.css',
    'tooltips.css',
    'MoleSequenceViewer.scss',
    'MolstarSlider.scss',
];

// Copy pattern joining `files` from `dir` in the listed order into a single `to` file
function concatPattern(dir, files, to) {
    return {
        from: `${dir}/*`,
        filter: file => files.includes(path.basename(file)),
        to,
        transformAll(assets) {
            const byName = new Map(assets.map(a => [path.basename(a.absoluteFilename), a]));
            return files.map(name => {
                const asset = byName.get(name);
                if (!asset) throw new Error(`Missing ${dir}/${name}`);
                const content = asset.data.toString();
                return name.endsWith('.scss')
                    ? sass.compileString(content, { loadPaths: [path.dirname(asset.absoluteFilename)] }).css
                    : content;
            }).join('\n');
        },
    };
}

module.exports = (env, argv) => {
    const isProd = argv.mode === 'production';

    return [
        {
            cache: {
                type: 'filesystem',
                buildDependencies: {
                    config: [__filename, path.resolve(__dirname, 'tsconfig.json')],
                },
            },
            mode: isProd ? 'production' : 'development',
            entry: {
                MOLEonline_View: './sources/src/View/App.tsx',
                MOLEonline_Init: './sources/src/Init/App.tsx',
            },
            output: {
                filename: '[name]-Core.js?version=R1.1.9.5',
                path: path.resolve(__dirname, 'dist/'),
                clean: true,
            },
            devtool: isProd ? false : 'source-map',

            optimization: isProd
                ? {
                    minimize: true,
                    minimizer: [
                        new TerserPlugin({
                            terserOptions: {
                                ecma: 2017,
                                compress: {
                                    ecma: 2017,
                                },
                                mangle: true,
                                format: {
                                    comments: false,
                                },
                            },
                            extractComments: false,
                        }),
                    ],
                }
                : {
                    minimize: false,
                },

            plugins: [
                new CopyWebpackPlugin({
                    patterns: [
                        concatPattern('sources/js', legacyScripts, 'js/scripts.js'),
                        concatPattern('sources/css', stylesheets, 'css/styles.css'),
                        { from: './sources/css/Init.css', to: 'css/init-styles.css' },
                        { from: './sources/images/*', to: () => `images/[name][ext]` },
                        { from: './sources/html/index.html', to: () => `index.html` },
                        {
                            from: './sources/html/*',
                            to: () => `html/[name][ext]`,
                            globOptions: { ignore: ['**/index.html'] },
                        },
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
                                compilerOptions: {
                                    target: 'es2017',
                                    module: 'esnext',
                                },
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
