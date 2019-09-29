import global from '../common/global.js';
let apiUrl = global.api;

function request(url, method, data) {
	let token = uni.getStorageSync("token");
	let token_type = uni.getStorageSync("token_type");
	let time = uni.getStorageSync("time");
	let expires_in = uni.getStorageSync("expires_in");
	// 验证是否有token
	if (token) {
		return new Promise((resolve, reject) => {
			let currentTime = Date.parse(new Date()) / 1000;
			// 验证token是否过期
			if (currentTime - time > (expires_in - 60)) {
				// 重新请求token
				uni.request({
					url: apiUrl + '/api/auth/refresh',
					method: "POST",
					dataType: "json",
					header: {
						Authorization: token_type + " " + token
					},
					success(res) {
						// 成功后重新保存token信息
						let time = Date.parse(new Date()) / 1000;
						if (res.data.access_token) {
							let token = res.data.access_token;
							let token_type = res.data.token_type;
							uni.setStorageSync("token", res.data.access_token);
							uni.setStorageSync("token_type", res.data.token_type);
							uni.setStorageSync("expires_in", res.data.expires_in);
							uni.setStorageSync("time", time)
							// 继续之前的请求
							uni.request({
								url: apiUrl + url,
								method,
								data,
								header: {
									Authorization: token_type + " " + token
								},
								dataType: "json",
								success(res) {
									resolve(res)
								},
								fail(res) {
									reject(res)
								}
							})
						}
					}
				})
			} else {
				uni.request({
					url: apiUrl + url,
					method,
					data,
					header: {
						Authorization: token_type + " " + token
					},
					dataType: "json",
					success(res) {
						resolve(res)
					},
					fail(res) {
						reject(res)
					}
				})
			}
		})
	} else {
		uni.redirectTo({
			url: '/pages/login/login',
		})
	}
}

export default request;
