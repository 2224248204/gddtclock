const {
	defineConfig
} = require('@vue/cli-service')
module.exports = defineConfig({
	devServer: {
		// host: 'localhost',
		port: 80,
	},
	publicPath: './',
	outputDir: 'dist',
	transpileDependencies: true,
	lintOnSave: false,
	/* devServer: {
		open: true,
		proxy: {
			'/': {
				//设置你调用的接口域名和端口号 别忘了加http
				target: 'http://localhost:8080/',
				changeOrigin: true, //允许跨域
				pathRewrite: {
					'^/api': 'http://localhost:8080/'
				}
			}
		}
	} */
})
