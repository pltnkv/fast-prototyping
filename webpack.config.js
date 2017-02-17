var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: {
		main: './src/index.ts',
		editor: './src/editor.ts'
	},
	stats: {
		// modules: true,
		// reasons: true
	},
	output: {
		publicPath: '',
		path: path.resolve('./target'),
		filename: '[name].js'
	},
	resolve: {
		root: [path.resolve('./src'), path.resolve('./node_modules')],
		modulesDirectories: ['node_modules'],
		extensions: ['', '.ts', '.tsx', '.js'],
		alias: {
			// lodash$: path.resolve('./static/scripts/general/lodash.min.js'),
			jquery: path.resolve('./libs/jquery-3.1.1.min.js'),
			signals: path.resolve('./static/scripts/signals.min.js'),
		}
	},

	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				include: path.resolve('./src'),
				loader: 'ts-loader'
			},
			{
				test: /\.(png|jpg|gif|ttf|eot|woff|woff2)$/,
				loader: 'file?name=[path][name].[ext]'
			}
		],
		noParse: [
			/lodash.min.js$/,
			/jquery.js$/
		]
	},

	devtool: 'inline-source-map',

	plugins: [
		new webpack.NoErrorsPlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './index.html'
		}),
		new HtmlWebpackPlugin({
			filename: 'editor.html',
			template: './editor.html'
		}),
		new webpack.ProvidePlugin({
			$: 'jquery',
			signals: 'signals'
		})
	],

	ts: {
		transpileOnly: true,
		compilerOptions: {
			target: 'ES5',
			sourceMap: true
		}
	},
	watch: true,
	keepalive: true,
	failOnError: false
};
