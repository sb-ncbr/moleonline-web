const gulp = require('gulp');
const concat = require('gulp-concat');
const beautify = require('gulp-beautify');
const sass = require('gulp-sass')(require('sass'));

const paths = {
    scss: {
        src: './sources/css/*.scss',
        dest: './sources/css'
    }
};

function compileSass() {
    return gulp.src(paths.scss.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.scss.dest));
}

function watchSass() {
    gulp.watch(paths.scss.src, compileSass);
}

gulp.task('default', gulp.series(compileSass, watchSass));

exports.compileSass = compileSass;
exports.watchSass = watchSass;

gulp.task("merge-js", function() {
    return gulp.src([
        "./sources/js/jquery-3.7.1.js",
        "./sources/js/jquery-ui.js",
        // "./sources/provided/js/02-jquery-ui.js",
        "./sources/js/jspdf.min.js",
        // "./sources/js/jsloader.js",
        "./sources/js/canvas2svg.js",
        "./sources/js/datagrid.js",
        "./sources/js/html2canvas.js",
        "./sources/js/Palette.js",
        "./sources/js/svg2pdf.js",
        "./sources/js/tabsConfig.js",
        "./sources/js/utf8.js",
        // "./sources/provided/js/00-fetch.min.js",
        // "./sources/provided/js/03-bootstrap.min.js",
        "./sources/js/bootstrap.min.js",
        // "./sources/provided/js/04-LiteMol-core.js",
        // "./sources/provided/js/05-LiteMol-plugin.js",
        // "./sources/provided/js/06-pako.min.js",
    ])
    .pipe(concat("scripts.js"))
    .pipe(beautify({
        indent_size: 2,
        space_in_empty_paren: true,
        preserve_newlines: true,
    }))
    .pipe(gulp.dest("./sources/js"))
})

gulp.task('merge-css', function() {
    return gulp.src([
        "./sources/css/bootstrap.min_5.3.3.css",
        "./sources/css/AglomeredParameters.css",
        "./sources/css/AlertMessages.css",
        "./sources/css/annotate.css",
        // "./sources/css/bootstrap.min.css",
        "./sources/css/ChannelParameters.css",
        "./sources/css/CofactorPickBox.css",
        "./sources/css/Components.css",
        "./sources/css/Controls.css",
        "./sources/css/CSAPickBox.css",
        "./sources/css/datagrid.css",
        "./sources/css/DownloadReport.css",
        "./sources/css/FromLiteMol.css",
        "./sources/css/Help.css",
        // "./sources/css/Init.css",
        "./sources/css/jquery-ui.css",
        "./sources/css/LayerVizualizerStyles.css",
        "./sources/css/lining-residues.css",
        "./sources/css/LoadingScreen.css",
        "./sources/css/pdbid.css",
        "./sources/css/PDFReportGenerator.css",
        "./sources/css/QuickHelp.css",
        "./sources/css/SequenceViewer.css",
        "./sources/css/style.css",
        "./sources/css/tabs.css",
        "./sources/css/tooltips.css",
        "./sources/css/MoleSequenceViewer.css",
        "./sources/css/MolstarSlider.css",
    ])
    .pipe(concat("styles.css"))
    .pipe(gulp.dest("./sources/css"))
})

gulp.task('merge-css-init', function() {
    return gulp.src([
        // "./sources/css/frontend/bootstrap.min.css",
        "./sources/css/init/bootstrap.min.css",
        // "./sources/css/frontend/cssloader.css",
        // "./sources/css/frontend/init-styles.css",
        // "./sources/css/frontend/LiteMol-plugin.css",
        // "./sources/css/frontend/styles-init.css",
        // "./sources/css/frontend/provided.css",
        "./sources/css/frontend/styles.css",
        // "./sources/css/frontend/cssloader.css~",
        // "./sources/css/frontend/print.front.css",
    ])
    .pipe(concat("init-styles.css"))
    .pipe(gulp.dest("./sources/css"))
})

gulp.task('merge-js-init', function() {
    return gulp.src([
        "./sources/js/jquery-3.7.1.js",
        "./sources/js/jquery-ui.js",
        "./sources/js/bootstrap.min.js",
        "./sources/js/canvas2svg.js",
        "./sources/js/datagrid.js",
        "./sources/js/html2canvas.js",
        "./sources/js/Palette.js",
        "./sources/js/svg2pdf.js",
        "./sources/js/tabsConfig.js",
        "./sources/js/utf8.js",
        "./sources/js/jspdf.min.js",
    ])
    .pipe(concat("init-scripts.js"))
    .pipe(beautify({
        indent_size: 2,
        space_in_empty_paren: true,
        preserve_newlines: true,
    }))
    .pipe(gulp.dest("./sources/js"))
})
