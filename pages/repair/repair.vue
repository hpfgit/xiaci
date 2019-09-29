<template>
	<view class="container">
		<view class="user card">
			<view>已选寄售商：{{jsName}}</view>
			<view @tap='is_return' class='cblue'>重新选择</view>
		</view>
		<view class='add_img_card card'>
			<view class='title'>添加鞋盒正面图片</view>
			<view class='img_list'>
				<view v-for="(item, index) in shoeboxImgArr" :key="index" class='img_box is_add_img'>
					<image :data-index='index' @tap='deteleImg' class='detele' src='../../static/images/close.png'></image>
					<image :src='item'></image>
				</view>
				<view @tap='add_shoeboxImg' class='add_img_button img_box'>
					<image src='../../static/images/add.png'></image>
				</view>
			</view>
		</view>
		<view class='add_img_card card'>
			<view class='title'>添加瑕疵图片</view>
			<view class='img_list'>
				<view v-for="(item, index) in imgArr" :key="index" class='img_box is_add_img'>
					<image :data-index='index' @tap='deteleImg' class='detele' src='../../static/images/close.png'></image>
					<image :src='item'></image>
				</view>
				<view @tap='add_img' class='add_img_button img_box'>
					<image src='../../static/images/add.png'></image>
				</view>
			</view>
		</view>
		<view class="add_remarks card">
			<view class="title">选择清洗/修复</view>
			<view class="check-box">
				<checkbox-group @change="checkboxChange">
					<label v-for="(item, index) in items" :key="index">
						<checkbox :value="item.value" :checked="item.checked" />{{item.name}}
					</label>
				</checkbox-group>
			</view>
		</view>
		<view class="add_remarks card">
			<view class='title'>添加备注信息</view>
			<textarea @input="add_remarks" :value='remarks' style='height: 110rpx; font-size: 28rpx; margin-bottom: 20rpx;'
			 placeholder='请输入文字(可不填)'></textarea>
			<view v-if="!is_recode_end" class='is_record'>
				<image class='startRecode' @tap="isRecode(is_recode)" src='../../static/images/startRecode.png'></image>
			</view>
			<view v-else class='play_record'>
				<view class='play_box'>
					<image class='play_bg' :src='isPlayImg(isplay)'></image>
					<view class='time_set'>
						<view class='time'>{{result_time}}</view>
						<image v-if="!isplay" @tap='playRecode' class='stop' src='../../static/images/play.png'></image>
						<image v-else class='stop' @tap='stop_play' src='../../static/images/stop.png'></image>
					</view>
				</view>
				<image class='remove' @tap='remove_record' src='../../static/images/remove.png'></image>
			</view>
		</view>
		<view class='footer'>
			<button @tap='is_submit'>提交修复</button>
			<button @tap='no_submit'>不可修复</button>
		</view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	const recorderManager = uni.getRecorderManager();
	const innerAudioContext = uni.createInnerAudioContext();
	let time1 = '';
	import qiniuUploader from '../../utils/qiniuUploader.js'; //七牛sdk
	import request from '../../utils/request.js';
	const app = getApp();

	export default {
		data() {
			return {
				id: '',
				imgArr: [],
				shoeboxImgArr: [],
				repairImgArr: [],
				shoeboxImgResArr: [],
				repairImgResArr: [],
				resultImgArr: [],
				qiniuToken: '',
				is_value: '',
				voice: '',
				is_recode: false,
				recode_load: false,
				is_recode_end: false,
				time: 0,
				result_time: '--:--',
				isplay: false,
				remarks: '',
				checked: [],
				totalPrice: 0,
				scheme: [],
				items: [
					{
						value: 'is_xi',
						name: '清洗',
						checked: true
					},
					{
						value: 'is_xiu',
						name: '修复'
					}
				]
			}
		},
		onLoad() {
			request('/api/auth/getQiniuToken', 'POST', {}).then(res => {
				console.log(res);
				this.qiniuToken = res.data;
			});
		},
		computed: {
			...mapState(['jsName', 'shapecode', 'jsId'])
		},
		methods: {
			checkboxChange: function(e) {
				let items = this.items,
					values = e.detail.value;
				for (let i = 0, lenI = items.length; i < lenI; ++i) {
					const item = items[i];
					if (values.includes(item.value)) {
						this.$set(item, 'checked', true);
					} else {
						this.$set(item, 'checked', false);
					}
				}
			},
			// 是否播放
			isPlayImg(isplay) {
				const ext = isplay ? "gif" : "png";
				let path = "../../static/images/play_bg.";
				const fullPath = path + ext;
				return fullPath;
			},
			// 添加鞋盒正面照图片
			add_shoeboxImg() {
				const that = this;
				let imgArr = this.shoeboxImgArr;
				console.log(imgArr);
				uni.chooseImage({
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success(res) {
						console.log(res, that);
						that.shoeboxImgArr = imgArr.concat(res.tempFilePaths);
					}
				})
			},
			// 添加修复或不可修复的图片
			add_img() {
				let that = this;
				let imgArr = that.imgArr;
				uni.chooseImage({
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success(res) {
						that.imgArr = imgArr.concat(res.tempFilePaths);
					}
				})
			},
			// 删除图片
			deteleImg(e) {
				let index = e.currentTarget.dataset.index;
				let arr = this.imgArr;
				arr.splice(index, 1)
				this.imgArr = arr
			},
			// 添加备注
			add_remarks(e) {
				let value = e.detail.value;
				this.remarks = value;
			},
			// 判断是否开始录音
			isRecode(is_recode) {
				if (is_recode) {
					this.stopRecode();
				} else {
					this.startRecode();
				}
			},
			// 开始录音
			startRecode() {
				console.log(11);
				const options = {
					duration: 10000, //指定录音的时长，单位 ms
					sampleRate: 16000, //采样率
					numberOfChannels: 1, //录音通道数
					encodeBitRate: 96000, //编码码率
					format: 'mp3', //音频格式，有效值 aac/mp3
					frameSize: 50, //指定帧大小，单位 KB
				}
				//开始录音
				recorderManager.start(options);
				recorderManager.onStart(() => {
					console.log('recorder start')
				});
				//错误回调
				recorderManager.onError((res) => {
					console.log(res);
				})
				this.recode_load = true;
				this.is_recode = true;
			},
			// 结束录音
			stopRecode() {
				console.log(22);
				let that = this;
				//停止录音
				recorderManager.stop();
				recorderManager.onStop((res) => {
					console.log(res)
					this.time = Math.round((res.duration / 1000));
					this.is_recode = false;
					this.voice = res.tempFilePath;
					this.is_recode_end = true;
					this.recode_load = false;
					console.log('停止录音', res.tempFilePath)
				})
			},
			// 播放录音
			playRecode() {
				let that = this;
				let time = this.time;
				innerAudioContext.src = that.voice;
				innerAudioContext.play();
				let num = 0;
				this.isplay = true
				time1 = setInterval(() => {
					num++
					console.log(time)
					if (num > time) {
						clearInterval(time1);
						innerAudioContext.stop();
						that.isplay = false
					} else {
						let result_time = parseInt(num / 60) + ":" + parseInt((parseFloat(num / 60) -
							parseInt(num / 60)) * 60);
						this.result_time = result_time;
					}
				}, 1000)
			},
			// 停止播放
			stop_play() {
				clearInterval(time1);
				innerAudioContext.stop();
				this.isplay = false
			},
			// 删除音频
			remove_record() {
				console.log(11);
				this.voice = ''
				this.is_recode = false
				this.recode_load = false
				this.is_recode_end = false
				this.time = 0
				this.result_time = '--:--'
				this.isplay = false
			},
			// 上传图片到七牛
			upImgs(imgArr, qiuniuToken) {
				let that = this;
				let resultImgArr = [];
				return new Promise((resolve, reject) => {
					imgArr.forEach(item => {
						var imgName = item.substr(30, 50);
						qiniuUploader.upload(item, res => {
							resultImgArr.push(res.imageURL);
							that.resultImgArr
							if (resultImgArr.length == imgArr.length) {
								resolve(resultImgArr)
							}
						}, error => {
							reject(error)
						}, {
							region: 'NCN',
							uploadURL: 'https://upload-z1.qiniup.com',
							domain: app.globalData.qiniuImgUrl,
							key: 'uploads/wash/' + imgName,
							uptoken: qiuniuToken
						})
					})
				})
			},
			// 上传录音
			upRecord(file, qiuniuToken) {
				let that = this;
				return new Promise((resolve, reject) => {
					var recordName = file.substr(30, 50);
					qiniuUploader.upload(file, res => {
						resolve(res)
					}, error => {
						reject(error)
					}, {
						region: 'NCN',
						uploadURL: 'https://upload-z1.qiniup.com',
						domain: app.globalData.qiniuImgUrl,
						key: 'uploads/record/' + recordName,
						uptoken: qiuniuToken
					})
				})
			},
			// 重新选择
			is_return() {
				uni.redirectTo({
					url: '../check/check',
				})
			},
			// 提交按钮
			is_submit() {
				uni.showLoading({
					mask: true,
					title: "加载中..."
				});
				let sound = '';
				if (this.imgArr.length == 0) {
					uni.hideLoading()
					uni.showToast({
						title: '至少添加一张瑕疵图片',
						icon: "none"
					});
					return
				}
				if (this.shapecode === "") {
					uni.hideLoading()
					uni.showToast({
						title: '条形码为必填项',
						icon: "none"
					});
					return
				}
				let that = this;
				let type_s = {};
				for (let i = 0; i < this.items.length; i++) {
					if (this.items[i].checked) {
						type_s[[this.items[i].value]] = 1;
					}
				}
				if (that.voice != "") {
					that.upRecord(that.voice, that.qiniuToken).then(res => {
						sound = res.imageURL;
						that.upImgs(that.imgArr, that.qiniuToken).then((original_image) => {
							console.log(original_image);
							that.upImgs(this.shoeboxImgArr, that.qiniuToken).then(shoes_image => {
								console.log(shoes_image);
								request("/api/auth/order", "POST", {
									consignor_id: that.jsId,
									bar_id: that.shapecode,
									original_image,
									shoes_image,
									remarks: that.remarks,
									sound,
									sound_length: this.time,
									is_xi: type_s['is_xi'],
									is_xiu: type_s['is_xiu']
								}).then(res => {
									uni.hideLoading();
									uni.showToast({
										title: res.data.message,
										icon: "none",
										duration: 1000,
										complete() {
											if (res.data.status == 200) {
												uni.showToast({
													title: '添加完成',
													icon: 'none'
												});
												setTimeout(() => {
													uni.navigateTo({
														url: "../sweep/sweep"
													});
												}, 1000);
											}
										}
									})
								});
							}).catch(error => {
								uni.hideLoading();
								uni.showToast({
									title: '图片上传失败',
									icon: "none"
								})
							});
						}).catch(error => {
							uni.hideLoading();
							uni.showToast({
								title: '图片上传失败',
								icon: "none"
							})
						})
					}).catch((res) => {
						uni.hideLoading()
						uni.showToast({
							title: '录音上传失败',
							icon: "none"
						})
					})
				} else {
					that.upImgs(that.imgArr, that.qiniuToken).then((original_image) => {
						console.log(original_image);
						that.upImgs(this.shoeboxImgArr, that.qiniuToken).then(shoes_image => {
							console.log(shoes_image);
							request("/api/auth/order", "POST", {
								consignor_id: that.jsId,
								bar_id: that.shapecode,
								original_image,
								shoes_image,
								remarks: that.remarks,
								sound,
								is_xi: type_s['is_xi'],
								is_xiu: type_s['is_xiu']
							}).then(res => {
								uni.hideLoading();
								uni.showToast({
									title: res.data.message,
									icon: "none",
									duration: 1000,
									complete() {
										uni.showToast({
											title: '添加完成',
											icon: 'none'
										});
										setTimeout(() => {
											uni.navigateTo({
												url: "../sweep/sweep"
											});
										}, 1000);
									}
								})
							});
						}).catch(error => {
							uni.hideLoading();
							uni.showToast({
								title: '图片上传失败',
								icon: "none"
							})
						});
					}).catch(error => {
						uni.hideLoading();
						uni.showToast({
							title: '图片上传失败',
							icon: "none"
						})
					})
				}
			},
			// 不可修复
			no_submit() {
				uni.showLoading({
					mask: true,
					title: "加载中..."
				});
				let sound = '';
				if (this.imgArr.length == 0) {
					uni.hideLoading()
					uni.showToast({
						title: '至少添加一张瑕疵图片',
						icon: "none"
					});
					return
				}
				if (this.shapecode === "") {
					uni.hideLoading()
					uni.showToast({
						title: '条形码为必填项',
						icon: "none"
					});
					return
				}
				let that = this;
				let type_s = {};
				for (let i = 0; i < this.items.length; i++) {
					if (this.items[i].checked) {
						type_s[[this.items[i].value]] = 1;
					}
				}
				if (that.voice != "") {
					that.upRecord(that.voice, that.qiniuToken).then(res => {
						sound = res.imageURL;
						that.upImgs(that.imgArr, that.qiniuToken).then((original_image) => {
							console.log(original_image);
							that.upImgs(this.shoeboxImgArr, that.qiniuToken).then(shoes_image => {
								console.log(shoes_image);
								const unrepair_image = shoes_image;
								request("/api/auth/order", "POST", {
									consignor_id: that.jsId,
									bar_id: that.shapecode,
									original_image,
									shoes_image,
									remarks: that.remarks,
									unrepair_image,
									sound,
									sound_length: this.time,
									is_xi: type_s['is_xi'],
									is_xiu: type_s['is_xiu'],
									states: 5
								}).then(res => {
									uni.hideLoading();
									uni.showToast({
										title: res.data.message,
										icon: "none",
										duration: 1000,
										complete() {
											if (res.data.status == 200) {
												uni.showToast({
													title: '添加完成',
													icon: 'none'
												});
												setTimeout(() => {
													uni.navigateTo({
														url: "../sweep/sweep"
													});
												}, 1000);
											}
										}
									})
								});
							}).catch(error => {
								uni.hideLoading();
								uni.showToast({
									title: '图片上传失败',
									icon: "none"
								})
							});
						}).catch(error => {
							uni.hideLoading();
							uni.showToast({
								title: '图片上传失败',
								icon: "none"
							})
						})
					}).catch((res) => {
						uni.hideLoading()
						uni.showToast({
							title: '录音上传失败',
							icon: "none"
						})
					})
				} else {
					that.upImgs(that.imgArr, that.qiniuToken).then((original_image) => {
						console.log(original_image);
						that.upImgs(this.shoeboxImgArr, that.qiniuToken).then(shoes_image => {
							console.log(shoes_image);
							const unrepair_image = shoes_image;
							request("/api/auth/order", "POST", {
								consignor_id: that.jsId,
								bar_id: that.shapecode,
								original_image,
								unrepair_image,
								shoes_image,
								remarks: that.remarks,
								sound,
								is_xi: type_s['is_xi'],
								is_xiu: type_s['is_xiu'],
								states: 5
							}).then(res => {
								uni.hideLoading();
								uni.showToast({
									title: res.data.message,
									icon: "none",
									duration: 1000,
									complete() {
										uni.showToast({
											title: '添加完成',
											icon: 'none'
										});
										setTimeout(() => {
											uni.navigateTo({
												url: "../sweep/sweep"
											});
										}, 1000);
									}
								})
							});
						}).catch(error => {
							uni.hideLoading();
							uni.showToast({
								title: '图片上传失败',
								icon: "none"
							})
						});
					}).catch(error => {
						uni.hideLoading();
						uni.showToast({
							title: '图片上传失败',
							icon: "none"
						})
					})
				}
			}
		}
	}
</script>

<style>
	page {
		padding: 20rpx;
		box-sizing: border-box;
		font-family: PingFangSC-Regular;
		font-size: 26rpx;
		line-height: 14px;
		background: #f5f4f9;
	}
	
	.container {
		padding-bottom: 110rpx;
	}

	.card {
		background-color: #ffffff;
		border-radius: 10rpx;
		margin-bottom: 18rpx;
		padding: 27rpx;
	}

	.user {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.is_code {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.change_value {
		flex: 1;
	}

	.icon_box image {
		width: 42rpx;
		height: 42rpx;
	}

	.title {
		padding-bottom: 30rpx;
	}

	.img_list {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
	}

	.img_box {
		width: 160rpx;
		height: 160rpx;
		background-color: #e4e7ef;
		border-radius: 4rpx;
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 15rpx;
		margin-right: 7rpx;
	}

	.img_box:nth-child(4n) {
		margin-right: 0rpx;
	}

	.add_img_button image {
		width: 60rpx;
		height: 60rpx;
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 21rpx 18rpx;
		background: #fff;
		display: flex;
		justify-content: space-around;
	}

	.footer button {
		background-color: #3748f9;
		border-radius: 48rpx;
		color: #fff;
		margin: 5rpx;
		flex: 1;
	}

	.is_add_img {
		position: relative;
	}

	.is_add_img image {
		width: 100%;
		height: 100%;
		display: inline-block;
	}

	.is_add_img .detele {
		position: absolute;
		z-index: 999;
		width: 40rpx;
		height: 40rpx;
		top: 5rpx;
		right: 5rpx;
	}

	/* 备注 */
	.add_remarks {
		background: #fff;
	}

	.recode {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.startRecode {
		width: 32rpx;
		height: 44rpx;
	}

	.recode_load {
		width: 350rpx;
		height: 350rpx;
		background-color: #000000;
		border-radius: 14rpx;
		opacity: 0.54;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.play_record {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	.play_box {
		width: 460rpx;
		height: 96rpx;
		background-color: #f3f4fb;
		border-radius: 48rpx;
		border: solid 2rpx #f0f1f6;
		position: relative;
	}

	.play_bg {
		position: absolute;
		width: 228rpx;
		height: 34rpx;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.time_set {
		position: absolute;
		z-index: 10;
		width: 460rpx;
		height: 96rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.time {
		width: 81rpx;
		height: 64rpx;
		line-height: 64rpx;
		text-align: center;
		background-color: #ffffff;
		border-radius: 32rpx;
		margin-left: 16rpx;
	}

	.play,
	.stop {
		width: 65rpx;
		height: 64rpx;
		margin-right: 16rpx;
	}

	.remove {
		width: 42rpx;
		height: 48rpx;
		margin-left: 32rpx;
	}

	/* 设置方案 */
	.toview {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		background-color: #fff;
	}

	.content .clearfix::after {
		content: "";
		display: block;
		clear: both;
		height: 0;
		width: 100%;
		visibility: hidden;
	}

	.content .top {
		display: flex;
		justify-content: space-between;
		padding: 24rpx 60rpx 24rpx 50rpx;
		border-radius: 5rpx;
		margin-top: 18rpx;
	}

	.content .top text {
		height: 40rpx;
		line-height: 40rpx;
	}

	.content button.wu {
		color: #ffffff;
		background-color: #8b9cbb;
		border-radius: 4rpx;
		border: none;
		cursor: pointer;
		font-size: 26rpx;
		display: inline-block;
	}

	.content .set {
		border-radius: 6rpx;
		padding: 30rpx;
	}

	.content .set .control {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.content .set .box {
		width: 49%;
		background-color: #ffffff;
		border-radius: 10rpx;
		margin-right: 2%;
		position: relative;
		margin-bottom: 18rpx;
		padding: 18rpx;
		float: left;
		box-sizing: border-box;
	}

	.content .set .box:nth-of-type(2n) {
		margin-right: 0;
	}

	.content .set .box .box-top {
		position: relative;
		display: flex;
		justify-content: space-between;
		height: 56rpx;
		align-items: center;
		border-bottom: 1rpx dashed #f5f6fb;
	}

	.content .set .box .spot {
		position: absolute;
		left: 0;
		top: 20rpx;
		width: 4rpx;
		height: 16rpx;
		background-color: #3151ff;
		border-radius: 0rpx 2rpx 2rpx 0rpx;
	}

	.content .set .box .bot-bot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 48rpx;
	}

	.content .set .box .bot-bot view:nth-of-type(2) {
		text-align: right;
		padding-right: 10rpx;
	}

	.content .set .box .num {
		width: 28rpx;
		background-color: #ffffff;
		border-radius: 28rpx;
		text-align: center;
		border: none;
		overflow: hidden;
	}

	.content .set .box .total {
		margin-left: 20rpx;
		margin-right: 20rpx;
	}

	.content .set .box .reduce {
		width: 40rpx;
		height: 40rpx;
		background-color: #fdeeec;
		border-radius: 28rpx;
		position: relative;
		cursor: pointer;
	}

	.content .set .box .reduce.disable {
		background-color: #ccc;
	}

	.content .set .box .reduce text {
		width: 12rpx;
		height: 2rpx;
		background-color: #ea524a;
		border-radius: 1rpx;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		margin: auto;
	}

	.content .set .box .add {
		width: 40rpx;
		height: 40rpx;
		background-color: #efedfe;
		border-radius: 28rpx;
		position: relative;
		cursor: pointer;
	}

	.content .set .box .add.disable {
		background-color: #ccc;
	}

	.content .set .box .add text {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
		margin: auto;
	}

	.content .set .box .add text:nth-of-type(1) {
		width: 12rpx;
		height: 2rpx;
		background-color: #343894;
		border-radius: 1rpx;
	}

	.content .set .box .add text:nth-of-type(2) {
		width: 2rpx;
		height: 12rpx;
		background-color: #343894;
		border-radius: 1rpx;
	}

	.content .set-btn {
		display: inline-block;
		padding: 0 10rpx;
		margin: 70rpx auto 56rpx auto;
		background-color: #3151ff;
		border-radius: 8rpx;
		color: #ffffff;
		text-align: center;
		border: none;
		cursor: pointer;
	}

	.box-toview {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.check-box label {
		margin-right: 40rpx;
	}
</style>
