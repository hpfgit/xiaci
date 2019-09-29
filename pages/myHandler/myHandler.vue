<template>
	<view class='my_handle'>
		<view class='my_search'>
			<view class='my_search_main'>
				<input @input='get_wd' :value='my_search_value' placeholder='快速查询'></input>
				<image @tap='is_scan' src='../../static/images/sweep.png'></image>
			</view>
			<button @tap='is_search' size='mini'>搜索</button>
		</view>
		<view class='top p20'>
			<view class='top_main p24'>
				<text class='user'>处理人员：{{user.username}}</text>
				<text>当前共{{count}}件</text>
			</view>
		</view>
		<view v-if="select != 4 && select != 5" class='list'>
			<view v-for="(item, index) in my_data" :key="index" class='item'>
				<view class='title'>{{item.time}}</view>
				<view class='item_top p24'>
					<view class='item_top_left'>
						<text>瑕疵图片</text>
					</view>
					<view class='id'>ID :{{item.bar_id}}</view>
				</view>
				<view class='imgs'>
					<scroll-view scroll-x="true" enable-flex="true" style='white-space: nowrap;'>
						<view v-for="(ite, idx) in item.original_image" :key="idx" class='img_item'>
							<image class='icon' :data-list='item.original_image' @tap='bigImg' :data-index='idx' :src='ite+"-thumb"'></image>
						</view>
					</scroll-view>
				</view>
				<view class='item_footer p24'>
					<view class='price'>处理费用 (￥{{item.price}})</view>
					<view class='price_info'>
						<text>{{item.scheme === null ? '暂无方案' : item.scheme}}</text>
					</view>
				</view>
				<!-- 处理后图片 -->
				<view class='handle_after p24'>
					<view class='handle_after_title'>处理后图片</view>
					<view class='imgs'>
						<scroll-view scroll-x="true" enable-flex="true" style='white-space: nowrap;'>
							<view v-for="(item, index) in item.end_image" :key="index" class='img_item'>
								<image class='icon' :data-list='item.end_image' @tap='bigImg' :data-index='index' :src='item+"-thumb"'></image>
							</view>
						</scroll-view>
					</view>
				</view>
			</view>
			<view class="wu" v-if="!my_data.length">暂无数据</view>
		</view>
	</view>
</template>

<script>
	import request from '../../utils/request.js';
	import {
		mapState
	} from 'vuex';

	export default {
		data() {
			return {
				user: {},
				washTab: [], //首页列表数据
				tab_select: 1,
				data: [],
				is_nav: 1,
				status: 1,
				my_data: [],
				page: 1,
				select_id: '',
				count: 0,
				my_search_value: ''
			}
		},
		computed: {
			...mapState(['id'])
		},
		onLoad: function(options) {
			let user = JSON.parse(uni.getStorageSync("user"));
			this.user = user;
			this.getMyData()
		},
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading();
			this.getMyData()
			uni.hideNavigationBarLoading();
			uni.stopPullDownRefresh();
		},
		onReachBottom: function() {
			let page = this.page;
			let that = this;
			page++
			uni.showNavigationBarLoading();
			this.getMyData(page, that.my_search_value)
			uni.hideNavigationBarLoading();
			uni.stopPullDownRefresh();
		},
		methods: {
			// 搜索
			is_search() {
				if (!this.my_search_value) {
					uni.showToast({
						title: '请输入条形码',
						icon: 'none'
					});
					return;
				}
				this.getMyData(this.page, this.my_search_value)
			},
			// 搜索内容
			get_wd(e) {
				console.log(e)
				let value = e.detail.value;
				this.my_search_value = value
			},
			// 我的处理 扫码
			is_scan() {
				let that = this;
				uni.scanCode({
					success(res) {
						console.log(res)
						that.my_search_value = res.result
					}
				})
			},
			// 查看大图
			bigImg(e) {
				console.log(e);
				let {
					index,
					list
				} = e.currentTarget.dataset;
				uni.previewImage({
					current: list[index], // 当前显示图片的http链接
					urls: list // 需要预览的图片http链接列表
				})
			},
			// 获取我的处理
			getMyData(page = 1) {
				uni.showLoading({
					title: '加载中...',
				});
				let my_data = this.my_data;
				let user = JSON.parse(uni.getStorageSync("user"));
				const search = this.my_search_value;
				request("/api/auth/getDone", "POST", {
					id: 24,
					page,
					search
				}).then(res => {
					uni.hideLoading();
					if (res.data.data.length == 0 && page !== 1) {
						uni.showToast({
							title: '已加载全部数据',
							icon: "none"
						})
						if (page > 1) {
							this.page = page - 1
						}
					} else {
						res.data.data.forEach(item => {
							var data = item.updated_at;
							var datatime = data.replace(/\-/g, "/")
							var time = new Date(datatime)
							item.original_image = JSON.parse(item.original_image);
							item.end_image = JSON.parse(item.end_image)
							item.stamp = Date.parse(new Date(item.updated_at));
							item.time = time.getFullYear() + "/" + (Number(time.getMonth()) + 1) + "/" + time.getDate();
						})
						if (page > 1) {
							this.my_data = this.my_data.concat(res.data.data)
						} else {
							this.my_data = res.data.data
							this.count = res.data.count
						}
					}
				})
			}
		}
	}
</script>

<style>
	.my_handle {
		padding-top: 100rpx;
		font-size: 28rpx;
	}

	.title {
		padding: 20rpx 24rpx;
		font-family: PingFangSC-Regular;
		font-size: 22rpx;
		background: #f4f5f9;
		color: #666666;
	}

	/* 搜索 */
	.my_search {
		display: flex;
		align-items: center;
		background: #fff;
		padding: 15rpx 24rpx;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		box-sizing: border-box;
		z-index: 99999;
	}

	.my_search button {
		height: 80rpx;
		line-height: 80rpx;
		background: #3745f9;
		color: #fff;
	}

	.my_search_main {
		height: 80rpx;
		flex: 1;
		background-color: #f2f2f2;
		display: flex;
		box-sizing: border-box;
		padding: 13rpx 25rpx;
		align-items: center;
		justify-content: space-between;
	}

	.my_search_main input {
		flex: 1;
	}

	.my_search_main image {
		width: 42rpx;
		height: 42rpx;
	}

	.top {
		padding-top: 24rpx;
	}

	.top_main {
		height: 90rpx;
		background-color: #ffffff;
		border-radius: 10rpx;
		display: flex;
		align-items: center;
		color: #fff;
		justify-content: space-between;
		background-image: linear-gradient(90deg,
			#87c1ff 0%,
			#3745f9 100%);
	}

	.top_main .user {
		font-weight: bold;
	}

	/* 处理后图片 */
	.handle_after_title {
		height: 65rpx;
		line-height: 65rpx;
		border-top: 2rpx solid #f5f4f9;
		font-family: PingFangSC-Semibold;
		font-size: 24rpx;
		color: #000000;
	}

	.item {
		background: #fff;
	}

	.item_top {
		display: flex;
		align-items: center;
		height: 69rpx;
		justify-content: space-between;
	}

	.item_top_left {
		display: flex;
		align-items: center;
	}

	.price {
		line-height: 76rpx;
		color: #3748f9;
		border-top: 2rpx dashed #f5f4f9;
		border-bottom: 2rpx dashed #f5f4f9;
	}

	.price_info {
		line-height: 76rpx;
		font-size: 26rpx;
		color: #000000;
		border-bottom: 2rpx dashed #f5f4f9;
	}

	.imgs {
		padding: 20rpx 0 20rpx 25rpx;
	}

	.imgs .img_item {
		width: 120rpx;
		height: 120rpx;
		display: inline-block;
		background-color: #c7c7c7;
		border-radius: 6px;
		margin-right: 10rpx;
	}

	.imgs .img_item image {
		width: 100%;
		height: 100%;
	}

	.wu {
		text-align: center;
		line-height: 36rpx;
		margin-top: 36rpx;
	}
</style>
