module.exports = {
  devServer: {
    proxy: {
    	'/route': {
		  	target: 'http://localhost:3000'
		  }
    }
  }
}