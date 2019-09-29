<template>
	<view class="sweep">
		<view class="uni-common-mt">
			<view class="uni-form-item uni-column">
				<input class="uni-input" focus placeholder="请填写条形码" @input="shapecodeFn" :value="shapecode" />
				<view class="sweep-img-box" @click="sweepHandler">
					<image src="../../static/images/sweep.png" class="sweep-img"></image>
				</view>
			</view>
		</view>
		<view class="btns">
			<view class="btn" @tap="repair" :data-shapecode="shapecode">
				清洗/修复
			</view>
			<view class="btn" @tap="noRepair">
				复查/返工
			</view>
		</view>
		<view class="btns">
			<view class="btn" @tap="setScheme">
				设置方案
			</view>
			<view class="btn" @tap="repairSuc">
				修复完成
			</view>
		</view>
		<view class="btns">
			<view class="btn" @tap="myHandler">
				我的清洗
			</view>
			<view class="btn" style="opacity: 0;">
				发现问题
			</view>
		</view>
	</view>
</template>

<script>
	import {mapMutations} from 'vuex';
	import request from '../../utils/request.js';
	
	export default {
		data() {
			return {
				shapecode: '',
				isRepair: false
			}
		},
		onLoad() {
			
		},
		methods: {
			...mapMutations(['upShapeCode']),
			sweepHandler: function() {
				const self = this;
				uni.scanCode({
					success(res) {
						self.shapecode = res.rawData;
						console.log(res);
					},
					fail(err) {
						wx.showToast({
							title: err.errMsg,
							icon: 'none'
						});
						console.log(err);
					}
				})
			},
			shapecodeFn(e) {
				this.shapecode = e.detail.value;
				this.upShapeCode(this.shapecode);
				console.log(e);
			},
			isEmpty() {
				if (this.shapecode === '') {
					uni.showToast({
						title: '请填写条形码',
						icon: 'none'
					});
					return false;
				}
				return true;
			},
			repair() {
				if (this.isEmpty()) {
					request('/api/auth/checkOrder', 'POST', {
						bar_id: this.shapecode,
					}).then(res => {
						this.isRepair = true;
						if (res.data.status === 201) {
							uni.showToast({
								title: '该商品正在修复中...',
								icon: 'none'
							});
						} else {
							uni.navigateTo({
								url: '../check/check'
							});
						}
					});
				}
			},
			noRepair() {
				if (this.isEmpty()) {
					request('/api/auth/checkOrder', 'POST', {
						bar_id: this.shapecode,
					}).then(res => {
						if (res.data.status !== 201) {
							uni.showToast({
								title: '请先清洗/修复商品...',
								icon: 'none'
							});
						} else {
							uni.navigateTo({
								url: '../checkOut/checkOut'
							});
						}
					});
				}
			},
			setScheme() {
				if (this.isEmpty()) {
					uni.navigateTo({
						url: '../setScheme/setScheme'
					})
				}
			},
			repairSuc() {
				if (this.isEmpty()) {
					request('/api/auth/checkOrder', 'POST', {
						bar_id: this.shapecode,
					}).then(res => {
						if (res.data.status !== 201) {
							uni.showToast({
								title: '请先清洗/修复商品...',
								icon: 'none'
							});
						} else {
							uni.navigateTo({
								url: '../repairSuc/repairSuc'
							});
						}
					});
				}
			},
			myHandler() {
				uni.navigateTo({
					url: '../myHandler/myHandler'
				})
			}
		}
	}
</script>

<style>
	.sweep {
		padding: 20rpx;
		box-sizing: border-box;
		font-family: PingFangSC-Regular;
		background: #f5f4f9;
		height: 100vh;
	}

	.uni-form-item {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx 27rpx;
		display: flex;
		align-items: center;
	}

	.uni-input {
		border: 1rpx solid #FFFFFF;
		flex: 1;
		font-size: 26rpx;
		color: #333333;
	}
	
	.sweep-img-box {
		padding-left: 20rpx;
	}

	.sweep-img {
		width: 42rpx;
		height: 42rpx;
	}

	.btns {
		display: flex;
		justify-content: space-around;
		margin-top: 60rpx;
	}

	.btn {
		padding: 30rpx 60rpx;
		background: #3748f9;
		color: #fff;
		font-size: 28rpx;
		border-radius: 10rpx;
	}
</style>
