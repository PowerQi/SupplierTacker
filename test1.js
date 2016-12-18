var request = require('request');

request.post({
		rejectUnauthorized: false,
		headers: {
			'Cookie': "PHPSESSID=f37911b3d630021808b45427c8090952",
			'Referer': "https://supplier.rt-mart.com.cn/index.php"
		},
		url: 'https://supplier.rt-mart.com.cn/php/scm_login_check.php',

		form: {
			"area": 123,
			"image.x": 10,
			"image.y": 1,
			"userid": "123123",
			"passwd": "123123",
			"checkstr": "123123"
		}
	},
	function(err, httpResponse, body) {
		console.log(err)
		console.log(httpResponse)
		console.log(body)
	})