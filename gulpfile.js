var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var serve = require('gulp-serve');
var browserify = require('gulp-browserify');
var babelify = require('babelify');
var workerify = require('workerify');
var concat = require('gulp-concat');
var sourcemaps = require("gulp-sourcemaps");

var paths = {
    source: './src/',
    bower: './bower_components/',
    lib: './lib/',
    test: './test/'
};

gulp.task('server', serve({
        root: './',
        port: process.env.PORT || 3000
    })
);

gulp.task('watch', function() {
    gulp.watch([paths.source + 'modules/*.js', paths.source + '*.js'], ['scripts', 'workers']);
    gulp.watch([paths.source + 'workers/*.js'], ['workers']);
    gulp.watch([paths.source + '*.html'], ['move']);
    gulp.watch([paths.source + 'styles/**/*.scss'], ['sass']);
});

gulp.task('scripts', function () {
    return gulp.src([paths.source + 'index.js'])
        .pipe(babel())
        .pipe(browserify({debug: true, transform: babelify}))
        .pipe(gulp.dest(paths.lib));
});

gulp.task('workers', function() {
    return gulp.src([paths.source + 'workers/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(browserify({debug: true, transform: babelify}))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.lib + 'workers/'));
});

gulp.task('move', function() {
    return gulp.src(paths.source + 'index.html')
        .pipe(plumber())
        .pipe(gulp.dest('./'))
});

gulp.task('sass', function() {
  gulp.src(paths.source + 'styles/main.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest(paths.lib + 'styles/'))
});

gulp.task('build', ['scripts', 'workers', 'sass', 'move']);
gulp.task('serve', ['build', 'server']);
gulp.task('develop', ['build', 'serve', 'watch']);