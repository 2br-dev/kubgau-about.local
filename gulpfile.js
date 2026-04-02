//= ::::::::::::: DECLARATIONS::::::::::::::::::: =//

const gulp = require('gulp');

//= STYLES ==========================================
const nodeSass = require('sass');
const gulpSass = require('gulp-sass');
const sass = gulpSass(nodeSass);
const autoprefixer = require('gulp-autoprefixer');
const cssbeautify = require('gulp-cssbeautify');


//= JAVASCRIPT ======================================
const webpack = require('webpack-stream');


//= HTML ============================================
const include = require('gulp-file-include');
const sync = require('browser-sync').init({
	server: {
		baseDir: './release/'
	}
});


//= ::::::::::::::::::: TASKS :::::::::::::::::::: =//
//= Styles ===========================================
gulp.task('scss', () => {
	return gulp.src('./src/scss/**/*.scss')
		.pipe(sass({
			includePaths: ['node_modules']
		}))
		.pipe(autoprefixer())
		.pipe(cssbeautify())
		.pipe(gulp.dest('./release/tulip-2026/css'))
		.pipe(sync.stream());
})

//= HTML =============================================
gulp.task('html', () => {
	return gulp.src('./src/html/*.html')
		.pipe(include())
		.pipe(gulp.dest('./release/'))
		.pipe(sync.stream())
})

//= JAVASCRIPT =======================================
gulp.task('java', () => {
	return gulp.src('./src/ts/master.ts')
		.pipe(webpack(require('./webpack.config.js')))
		.pipe(gulp.dest('release/tulip-2026/js/'))
		.pipe(sync.stream())
});

//= BUILD ============================================
gulp.task('build', () => {
	return gulp.src('./src/ts/master.ts')
		.pipe(webpack(require('./webpack.build-config.js')))
		.pipe(gulp.dest('release/tulip-2026/js'))
		.pipe(sync.stream())
})

//= WATCH ============================================
gulp.task('watch', () => {
	gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));
	gulp.watch('./src/html/**/*.html', gulp.series('html'));
	gulp.watch('./src/ts/**/*.*', gulp.series('java'));
})
