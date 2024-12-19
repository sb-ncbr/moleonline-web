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

gulp.task('compile-sass', function () {
    return gulp.src(paths.scss.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.scss.dest));
});

gulp.task("merge-js", function() {
    return gulp.src([
        "./node_modules/jquery/dist/jquery.min.js",
        "./node_modules/jquery-ui-dist/jquery-ui.min.js",
        "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
        "./node_modules/utf8/utf8.js",
        "./sources/js/canvas2svg.js",
        "./sources/js/datagrid.js",
        "./sources/js/Palette.js",
        "./sources/js/tabsConfig.js",
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
        "./node_modules/bootstrap/dist/css/bootstrap.min.css",
        "./node_modules/jquery-ui-dist/jquery-ui.min.css",
        "./sources/css/AglomeredParameters.css",
        "./sources/css/AlertMessages.css",
        "./sources/css/annotate.css",
        "./sources/css/ChannelParameters.css",
        "./sources/css/CofactorPickBox.css",
        "./sources/css/Components.css",
        "./sources/css/Controls.css",
        "./sources/css/CSAPickBox.css",
        "./sources/css/datagrid.css",
        "./sources/css/DownloadReport.css",
        "./sources/css/FromLiteMol.css",
        "./sources/css/Help.css",
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
        "./node_modules/bootstrap/dist/css/bootstrap.min.css",
        "./sources/css/Init.css",
    ])
    .pipe(concat("init-styles.css"))
    .pipe(gulp.dest("./sources/css"))
})

gulp.task('merge-js-init', function() {
    return gulp.src([
        "./node_modules/jquery/dist/jquery.min.js",
        "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js",
    ])
    .pipe(concat("init-scripts.js"))
    .pipe(beautify({
        indent_size: 2,
        space_in_empty_paren: true,
        preserve_newlines: true,
    }))
    .pipe(gulp.dest("./sources/js"))
})
