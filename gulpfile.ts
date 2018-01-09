import * as fs from 'fs'
import * as gulp from 'gulp'
import compilets from './ext/Compile'

let DEBUG = false;
let  environment = (process.env.ENVIRONMENT!==void 0)?process.env.ENVIRONMENT:"local";

console.log(`Building for '${environment}' environment...`);

function plugin(name: string) {
    let cached: any;
    return function() {
        if (cached) return cached;
        cached = require(name);
        return cached;
    }
}

const plugins = {
    concat: plugin('gulp-concat'),
    rename: plugin('gulp-rename'),
    replace: plugin('gulp-replace'),
    merge: plugin('merge2'),
    clean: plugin('gulp-clean'),
    insert: plugin('gulp-insert'),
    sass: plugin('gulp-sass'),
    uglify: plugin('gulp-uglify'),
    tar: plugin('gulp-tar'),
    gzip: plugin('gulp-gzip'),
    typedoc: plugin('gulp-typedoc'),
};

let sourcesPath = './sources';
let destDir = './'+'build'+'/online';
let tmpDir = './tmp';

function buildViewResources(){
    let projectPath = `${sourcesPath}/View`;
        let src = gulp.src([
        projectPath + '/*', 
        '!'+projectPath + 'tsconfig.json',]).pipe(gulp.dest(destDir))
        
        let minify = !DEBUG;

        let providedCss = [sourcesPath + '/provided/css/*'];
        let css = gulp.src([sourcesPath + '/css/*','!'+sourcesPath + '/css/Init.css'])
        .pipe(plugins.sass()({ outputStyle: minify ? 'compressed' : void 0 }).on('error', plugins.sass().logError))
        .pipe(plugins.concat()('styles.css'))
        .pipe(gulp.dest(destDir + '/css'));

        let cssMin = gulp.src(providedCss)
        .pipe(plugins.concat()('provided.css'))
        .pipe(plugins.sass()({ outputStyle: minify ? 'compressed' : void 0 }).on('error', plugins.sass().logError))
        .pipe(gulp.dest(destDir + '/css'));

        let providedJs = [sourcesPath + '/provided/js/*'];
        
        let jsMin = gulp.src(providedJs)
        .pipe(plugins.concat()("provided.js"))
        .pipe(plugins.uglify()())
        .pipe(gulp.dest(destDir + '/js'));

        let js = gulp.src([sourcesPath + '/js/*'])
        .pipe(plugins.concat()("scripts.js"))
        .pipe(plugins.uglify()())
        .pipe(gulp.dest(destDir + '/js'));

        let fonts = gulp.src([sourcesPath +'/fonts/*'])
        .pipe(gulp.dest(destDir + '/fonts'));

        let images = gulp.src([sourcesPath + '/images/*'])
        .pipe(gulp.dest(destDir + '/images'));

        let imagesFront = gulp.src([sourcesPath + '/images/front/*'])
        .pipe(gulp.dest(destDir + '/images/front'));

        let templates = gulp.src([sourcesPath + '/templates/*'])
        .pipe(gulp.dest(destDir + '/templates'));

        let bootstrapStandalone = gulp.src([sourcesPath + '/css/bootstrap.min.css'])
        .pipe(gulp.dest(destDir + '/css'));

        return plugins.merge()([src, cssMin, css, jsMin, js, fonts, images, imagesFront, templates, bootstrapStandalone]);
}

function buildInitResources(){
    let projectPath = `${sourcesPath}/Init`;
        let src = gulp.src([
        projectPath + '/*', 
        '!'+projectPath + 'tsconfig.json']).pipe(gulp.dest(destDir))

        let providedJs = [
            /*sourcesPath + '/provided/src/LiteMol-plugin.js'*/
            sourcesPath + '/provided/src/react.js',
            sourcesPath + '/provided/src/react-with-addons.js',
            sourcesPath + '/provided/src/react-dom.js',
            sourcesPath + '/provided/src/react-dom-server.js'
        ];

        let minify = !DEBUG;
        
        let css = gulp.src([
            sourcesPath + '/css/Init.css',
            sourcesPath + '/css/AlertMessages.css'
        ])
        .pipe(plugins.sass()({ outputStyle: minify ? 'compressed' : void 0 }).on('error', plugins.sass().logError))

        .pipe(plugins.concat()('init-styles.css'))
        .pipe(gulp.dest(destDir + '/css'));

        return plugins.merge()([src]);
}

function copyHtmlFiles(){
    let projectPath = `${sourcesPath}/html`;
        let files = gulp.src([projectPath +'/*'])
        .pipe(gulp.dest(destDir));

        return plugins.merge()([files]);
}

gulp.task('Clean', ['Clean-Tmp'], function () {
    console.log("Cleaning build folder...");
    return gulp
        .src([
            './build/*'
        ], { read: false })
        .pipe(plugins.clean()());
});

gulp.task('Clean-Tmp', [], function () {
        console.log("Cleaning tmp folder...");
        return gulp
            .src([
                './tmp'
            ], { read: false })
            .pipe(plugins.clean()());
});

gulp.task('Copy-Config', ['Clean'], function(){
    let configFiles = gulp.src([`${sourcesPath}/config/${environment}.ts`])
        .pipe(plugins.concat()("config.ts"))
        .pipe(gulp.dest(tmpDir));

        return plugins.merge()([configFiles]);
});
gulp.task('MoleOnlineWebUI-View-Core', ['Copy-Config'], function() { 
    return compilets({ project: `${sourcesPath}/src/View/tsconfig.json`, out: `${destDir}/MoleOnlineWebUI-Core-View.js` });
});
gulp.task('MoleOnlineWebUI-Init-Core', ['Copy-Config'], function() { 
    return compilets({ project: `${sourcesPath}/src/Init/tsconfig.json`, out: `${destDir}/MoleOnlineWebUI-Core-Init.js` });
});
gulp.task('MoleOnlineWebUI-View-Resources', ['MoleOnlineWebUI-View-Core'], buildViewResources);
gulp.task('MoleOnlineWebUI-Init-Resources', ['MoleOnlineWebUI-Init-Core'], buildInitResources);
gulp.task('MoleOnlineWebUI-Copy-Html-Files', ['Clean'], copyHtmlFiles);

gulp.task('default', [
    'Clean',
    'MoleOnlineWebUI-View-Resources',
    'MoleOnlineWebUI-Init-Resources',
    'MoleOnlineWebUI-Copy-Html-Files'
], function () {
    console.log('Done');
});
