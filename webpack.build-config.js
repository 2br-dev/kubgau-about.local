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
