<template>
	<view class="scheme">
		<view class="content">
			<view class="toview">
				<view>选择类目（可多选）</view>
				<!-- <view style="text-align: right;">
	                <button class="wu" bindtap="noFix">无法修复，直接退回</button>
	            </view> -->
			</view>
			<view class="set">
				<view class="clearfix">
					<view class="box" v-for="(item, index) in scheme" :key="index">
						<view class="sviewot" v-if="item.num"></view>
						<view class="box-toview">
							<view class="title">{{item.title}}</view>
							<view class="control">
								<view @tap="reduce" :data-index="index" class="reduce" :class="item.num <= 0 ? 'disable' : ''">
									<text></text>
								</view>
								<view class="num total">
									<text class="num">{{item.num}}</text>
								</view>
								<view class="add" @tap="add" :data-index="index">
									<text></text>
									<text></text>
								</view>
							</view>
						</view>
						<view class="bot-bot">
							<view>单价:￥{{item.price}}</view>
							<view style="color: #3151ff;">总价:{{item.totalPrice}}</view>
						</view>
					</view>
				</view>
				<view style="text-align: center;">
					<button class="set-btn" v-if="scheme.length" @tap="setSubmit">已选项{{checked.length}}，共计￥{{totalPrice}}，提交
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '../../utils/request.js';
	import {
		mapState,
		mapMutations
	} from 'vuex';

	export default {
		data() {
			return {
				checked: [],
				totalPrice: 0,
				scheme: []
			}
		},
		computed: {
			...mapState(['shapecode', 'jsId'])
		},
		onLoad() {
			uni.showLoading({
				title: '加载中...',
			});
			request("/api/auth/tabLists", "POST", {}).then(res => {
				console.log(res.data.data);
				res.data.data.forEach(item => {
					item.num = 0;
					item.totalPrice = 0;
					item.checked = false;
				});
				this.scheme = res.data.data
				uni.hideLoading();
			});
			request('/api/auth/getOrder', 'POST', {
				bar_id: this.shapecode
			}).then(res => {
				this.upJSId(res.data[0].consignor_id);
				console.log(res);
			});
		},
		methods: {
			...mapMutations(['upJSId']),
			add(e) {
				const idx = e.currentTarget.dataset.index;
				const arr = [];
				this.scheme[idx].num += 1;
				if (idx === 0) {
					this.scheme[idx].num = 1;
				}
				if (idx === 2) {
					this.scheme[idx].num = 1;
				}
				this.scheme[idx].checked = true;
				this.scheme[idx].totalPrice = this.scheme[idx].num * this.scheme[idx].price;
				this.totalPrice = 0;
				this.scheme.forEach(item => {
					this.totalPrice += item.totalPrice;
					if (item.checked) {
						arr.push(item);
					}
				});
				this.checked = arr;
			},
			reduce(e) {
				const idx = e.currentTarget.dataset.index;
				const arr = [];
				if (this.scheme[idx].num <= 1 && this.scheme[idx].checked !== false) {
					this.scheme[idx].num = 0;
					this.scheme[idx].totalPrice = this.scheme[idx].num * this.scheme[idx].price;
					this.totalPrice -= this.scheme[idx].price;
					this.scheme[idx].checked = false;
					this.scheme.forEach(item => {
						if (item.checked) {
							arr.push(item);
						}
					});
					this.checked = arr;
					console.log(this.checked, idx);
					return;
				}
				if (this.scheme[idx].num <= 1) {
					return;
				}
				this.scheme[idx].num -= 1;
				this.scheme[idx].totalPrice = this.scheme[idx].num * this.scheme[idx].price;
				this.totalPrice -= this.scheme[idx].price;
			},

			setSubmit() {
				if (this.checked.length <= 0) {
					uni.showToast({
						title: '至少选择一个方案',
						icon: 'none'
					});
					return;
				}
				uni.showLoading({
					title: '加载中...',
				});
				let scheme = "";
				let tab_ids = "";
				this.scheme.forEach(item => {
					if (item.num !== 0) {
						scheme += `${item.title} ￥${item.price}*${item.num} `;
						tab_ids += `,${item.id}`;
					}
				});
				tab_ids += ",";
				request("/api/auth/scheme", "POST", {
					scheme,
					tab_ids,
					bar_id: this.shapecode,
					user_id: this.jsId,
					price: this.totalPrice
				}).then(res => {
					console.log(res);
					uni.hideLoading();
					uni.showToast({
						title: '设置成功',
						icon: 'none',
						duration: 2000,
						complete: () => {
							setTimeout(() => {
								uni.navigateTo({
									url: '../sweep/sweep',
								});
							}, 1000);
						}
					});
				}).catch(error => {
					uni.hideLoading();
					uni.showToast({
						title: '设置失败',
						icon: 'none'
					});
				});
			}
		}
	}
</script>

<style>
	.scheme {
		height: 100vh;
		background-color: #f5f4f9;
		font-size: 28rpx;
	}

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
		padding: 0 20rpx;
		margin: 70rpx auto 56rpx auto;
		background-color: #3151ff;
		border-radius: 8rpx;
		color: #ffffff;
		text-align: center;
		border: none;
		cursor: pointer;
		font-size: 32rpx;
	}

	.box-toview {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
