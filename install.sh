clear;
yarn init;

mkdir -p src/html/data 
mkdir -p src/html/parts
mkdir -p src/scss/parts
mkdir -p src/scss/frameworks
mkdir -p src/scss/pages
mkdir -p src/ts/lib
mkdir -p release/img
mkdir -p release/css
mkdir -p release/fonts
mkdir -p release/js

tee .babelrc > /dev/null <<EOT

{
	"presets": [
		"@babel/preset-env",
		"@babel/preset-typescript"
	]
}
EOT

tee webpack.config.js > /dev/null << EOT
const { webpack, ProvidePlugin } = require("webpack");
const path = require('path');

module.exports = {
	devtool: 'inline-source-map',
	output: {
		path: path.resolve(__dirname, 'src'),
		filename: 'master.js'
	},
	mode: "development",
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	module: {
		rules:[{
			test: /\.ts?$/,
			loader: 'babel-loader',
		}]
	},
	plugins: [
		new ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			'window.$': 'jquery',
			'window.jQuery': 'jquery'
		})
	],
}
EOT

tee webpack.build-config.js > /dev/null << EOT
const { webpack, ProvidePlugin } = require("webpack");
const path = require('path');

module.exports = {
	output: {
		path: path.resolve(__dirname, 'src'),
		filename: 'master.js'
	},
	mode: "production",
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	module: {
		rules:[{
			test: /\.ts?$/,
			loader: 'babel-loader',
		}]
	},
	plugins: [
		new ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			'window.$': 'jquery',
			'window.jQuery': 'jquery'
		})
	],
}
EOT

tee ./src/scss/parts/_vars.scss > /dev/null << EOT
//= Media queries ========================================
//= Less, then extra-small	// T (tiny)
\$extra-small: 400px;			// XS (extra-small)
\$small: 600px;						// S (small)
\$medium: 850px;						// M (medium)
\$large: 1200px;						// L (large)
\$extra-large: 1800px;			// XL (extra-large)
\$huge: 1901px;						// H (huge)

//= Columns gutter =======================================
\$cols: 12;								// Column-count
\$gutter-width: 20px;			// Space between columns

\$paper: #131413;
\$accent: #BD89FF;
EOT

tee ./src/scss/parts/_custom_grid.scss > /dev/null << EOT
.container {
	margin: 0 auto;
	max-width: \$huge;
	width: 95%;
}

@media (min-width: \$medium) {
	.container {
		width: 90%;
	}
}

@media (min-width: \$large) {
	.container {
		width: 85%;
	}
}

.col .row {
	margin-left: (-1 * \$gutter-width / 2);
	margin-right: (-1 * \$gutter-width / 2);
}

.section {
	padding-top: 1rem;
	padding-bottom: 1rem;

	&.no-pad {
		padding: 0;
	}

	&.no-pad-bot {
		padding-bottom: 0;
	}

	&.no-pad-top {
		padding-top: 0;
	}
}


// Mixins to eliminate code repitition
@mixin reset-offset {
	margin-left: 0;
	left: auto;
	right: auto;
}

@mixin gridCol(\$class) {
	\$i: 1;

	@while(\$i <=\$cols) {
		
		\$perc: unquote((100 / (\$cols / \$i)) + "%");

		&.#{\$class}#{\$i} {
			width: \$perc;
			@include reset-offset();
		}

		\$i: \$i+1;
	}

	\$i: 1;

	@while(\$i <=\$cols) {
		\$perc: unquote((100 / (\$cols / \$i)) + "%");

		&.offset-#{\$class}#{\$i} {
			margin-left: \$perc;
		}

		&.pull-#{\$class}#{\$i} {
			right: \$perc;
		}

		&.push-#{\$class}#{\$i} {
			left: \$perc;
		}

		\$i: \$i+1;
	}
}

.row {
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 20px;

	&.flex{
		display: flex;
		flex-wrap: wrap;

		& > .col{
			float: none;
		}
	}

	&.vcenter{
		align-items: center;
	}

	// Clear floating children
	&:after {
		content: "";
		display: table;
		clear: both;
	}

	.col {
		float: left;
		box-sizing: border-box;
		padding: 0 \$gutter-width / 2;
		min-height: 1px;
		width: 100%;

		&[class*="push-"],
		&[class*="pull-"] {
			position: relative;
		}


		//= Tiny rules ==========================================

		@media(max-width: \$extra-small) {
			@include gridCol("t");
		}

		// //= Extra-small rules ===================================

		@media(min-width: \$extra-small) {
			@include gridCol("xs");
		}

		// //= Small rules =========================================
		@media(min-width: \$small) {
			@include gridCol("s");
		}

		// //= Medium rules =========================================
		@media(min-width: \$medium) {
			@include gridCol('m');
		}

		// //= Large rules ==========================================
		@media(min-width: \$large) {
			@include gridCol('l');
		}

		// //= Extra-large rules ====================================
		@media(min-width: \$extra-large) {
			@include gridCol('xl');
		}

		// //= Huge rules ====================================
		@media(min-width: \$huge) {
			@include gridCol('h');
		}
	}
}

@mixin hide(\$class, \$min, \$max){
	.hide-#{\$class}-down{@media(max-width: \$min){display: none !important;}}
	.hide-#{\$class}-up{@media(min-width: \$min){display: none !important;}}
	.hide-#{\$class}-only{@media(min-width: \$min) and (max-width: \$max){display: none !important;}}
}

@mixin left(\$class, \$min, \$max){
	.hide-#{\$class}-down{@media(max-width: \$min){text-align: left;}}
	.hide-#{\$class}-up{@media(min-width: \$min){text-align: left;}}
	.hide-#{\$class}-only{@media(min-width: \$min) and (max-width: \$max){text-align: left;}}
}

@mixin center(\$class, \$min, \$max){
	.hide-#{\$class}-down{@media(max-width: \$min){text-align: center;}}
	.hide-#{\$class}-up{@media(min-width: \$min){text-align: center;}}
	.hide-#{\$class}-only{@media(min-width: \$min) and (max-width: \$max){text-align: center;}}
}

@mixin right(\$class, \$min, \$max){
	.hide-#{\$class}-down{@media(max-width: \$min){text-align: right;}}
	.hide-#{\$class}-up{@media(min-width: \$min){text-align: right;}}
	.hide-#{\$class}-only{@media(min-width: \$min) and (max-width: \$max){text-align: right;}}
}

@mixin align(\$direction, \$class, \$min, \$max){
	.align-#{\$direction}-#{\$class}-down{@media(max-width: \$min){text-align: #{\$direction};}}
	.align-#{\$direction}-#{\$class}-up{@media(min-width: \$min){text-align: #{\$direction};}}
	.align-#{\$direction}-#{\$class}-only{@media(min-width: \$min) and (max-width: \$max){text-align: #{\$direction};}}
}

@mixin alignFrom(\$direction, \$class, \$min){
	.align-#{\$direction}-#{\$class}{@media(min-width: \$min){text-align: #{\$direction};}}
}

@mixin order(\$class, \$media, \$orderNum){
	.order-#{\$class}#{\$orderNum}{
		@media(max-width: \$media){
			order: \$orderNum;
		}
	}
}

// Hide
@include hide(s, \$small, \$medium);
@include hide(m, \$medium, \$large);
@include hide(l, \$large, \$extra-large);
@include hide(xl, \$extra-large, \$huge);
.hide-h{@media(min-width: \$huge){display: none;}}

// Align
@include align(left, s, \$small, \$medium);
@include align(center, s, \$small, \$medium);
@include align(right, s, \$small, \$medium);
@include align(left, m, \$medium, \$large);
@include align(center, m, \$medium, \$large);
@include align(right, m, \$medium, \$large);
@include align(left, l, \$large, \$extra-large);
@include align(center, l, \$large, \$extra-large);
@include align(right, l, \$large, \$extra-large);
@include align(left, xl, \$extra-large, \$huge);
@include align(center, xl, \$extra-large, \$huge);
@include align(right, xl, \$extra-large, \$huge);
@include alignFrom(left, h, \$huge);
@include alignFrom(center, h, \$huge);
@include alignFrom(right, h, \$huge);

// Order
\$medias: ( \$extra-small, \$small, \$medium, \$large, \$extra-large );
\$classes: ( 'xs', 's', 'm', 'l', 'xl' );

@for \$z from 1 to length(\$medias){
	
	@for \$i from 1 to \$cols{
		@include order(nth(\$classes, \$z), nth(\$medias, \$z), \$i);
	}
}
EOT

tee gulpfile.js > /dev/null <<EOT
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
const beautify = require('gulp-html-beautify');
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
		.pipe(gulp.dest('./release/css'))
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
		.pipe(gulp.dest('release/js/'))
		.pipe(sync.stream())
});

//= BUILD ============================================
gulp.task('build', () => {
	return gulp.src('./src/ts/master.ts')
		.pipe(webpack(require('./webpack.build-config.js')))
		.pipe(gulp.dest('release/js'))
		.pipe(sync.stream())
})

//= WATCH ============================================
gulp.task('watch', () => {
	gulp.watch('./src/scss/**/*.scss', gulp.series('scss'));
	gulp.watch('./src/html/**/*.html', gulp.series('html'));
	gulp.watch('./src/ts/**/*.*', gulp.series('java'));
})
EOT

# core
yarn add --dev gulp browser-sync gulp-sourcemaps

# html
yarn add --dev gulp-file-include

# styles
yarn add --dev gulp-sass sass gulp-autoprefixer@8.0.0 gulp-cssbeautify

# scripts
yarn add webpack webpack-stream @babel/core @babel/preset-env @babel/preset-typescript babel-loader

# extra
yarn add --dev materialize-css swiper vanilla-lazyload jquery @types/jquery

touch ./src/html/index.html
touch ./release/index.html
touch ./src/scss/master.scss
touch ./src/ts/master.ts