<template>
	<view class="login">
		<view class='title'>洗护瑕疵仓登录</view>
		<view class='is_form'>
			<view class='user'>
				<input maxlength="11" @input="change_user" placeholder="请输入账号" />
			</view>
			<view class='pass'>
				<input type='password' @input="change_pass" placeholder="请输入密码" />
			</view>
		</view>
		<view class='is_button'>
			<button @tap='is_login'>登录</button>
		</view>
	</view>
</template>

<script>
	import global from '../../common/global.js';
	let apiUrl = global.api;
	import request from '../../utils/request.js';
	import {
		mapState,
		mapMutations
	} from 'vuex';
	export default {
		data() {
			return {
				user: "",
				pass: ""
			}
		},
		methods: {
			...mapMutations(['upId', 'expireTime', 'upToken', 'expireIn', 'tokenType']),
			// 登录
			is_login() {
				if (this.user === "" || this.pass === "") {
					uni.showToast({
						title: '请输入账户与密码',
						icon: "none"
					});
					return
				}
				uni.showLoading({
					title: '正在加载...',
				});
				const that = this;
				uni.request({
					url: apiUrl + '/api/app/login',
					method: 'POST',
					data: {
						mobile: this.user,
						password: this.pass
					},
					success(res) {
						console.log(res);
						if (res.statusCode == 200) {
							let user = res.data.user;
							let time = Date.parse(new Date()) / 1000;
							uni.setStorageSync("token", res.data.access_token);
							uni.setStorageSync("token_type", res.data.token_type);
							uni.setStorageSync("expires_in", res.data.expires_in);
							uni.setStorageSync("time", time);
							// that.expireTime(res.data.expires_in);
							// that.upToken(res.data.access_token);
							// that.expireIn(time);
							// that.tokenType(res.data.token_type);
							request("/api/auth/me", "POST").then(res => {
								uni.setStorageSync("user", JSON.stringify(res.data));
								let id = res.data.id;
								that.upId(id);
								uni.hideLoading();
								switch (res.data.type) {
									case 1:
										uni.redirectTo({
											url: '/pages/sweep/sweep',
										})
										break;
									case 2:
										uni.redirectTo({
											url: '/pages/List/list',
										})
										break;
									case 3:
										uni.redirectTo({
											url: '/pages/sweep/sweep',
										})
										break;
									default:
										break;
								}
							}).catch(res => {
								uni.showToast({
									title: '获取用户信息失败',
									icon: "none"
								})
							})
						} else {
							uni.hideLoading()
							uni.showToast({
								title: '账号或密码输入错误',
								icon: "none"
							})
						}
					}
				});
			},
			// 获取用户名
			change_user(e) {
				this.user = e.detail.value
			},
			// 获取密码
			change_pass(e) {
				this.pass = e.detail.value
			}
		}
	}
</script>

<style>
	page {
		background: #fff;
		height: 100vh;
	}

	.login {
		padding: 0 40rpx;
	}

	.title {
		font-family: PingFangSC-Medium;
		font-size: 40rpx;
		line-height: 32rpx;
		font-weight: bold;
		color: #454454;
		padding-top: 80rpx;
	}

	.user,
	.pass {
		border-bottom: 2rpx solid #f4f5f9;
		height: 110rpx;
		line-height: 110rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding-bottom: 25rpx;
	}

	.user input,
	.pass input {
		font-weight: 28rpx;
		padding-left: 8rpx;
	}

	.is_button {
		margin-top: 63rpx;
		padding: 0 40rpx;
	}

	.is_button button {
		background-color: #3a50f5;
		color: #fff;
	}
</style>
