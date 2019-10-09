<template>
	<view class="container">
		<scroll-view class="nav" scroll-x="true" style="white-space: nowrap;">
			<view class="nav_item" :class="select == item.id ? 'active' : ''" v-for="(item, index) in nav" :key="index" @tap="change_nav"
			 :data-selectIndex="index" :data-index="item.id" :data-page="item.page">
				<view>
					{{ item.name }}
					<text v-if="item.num > 0">({{ item.num }})</text>
				</view>
			</view>
		</scroll-view>

		<view class="list">
			<view class="no-data" v-if="!data[select].length"><text>暂无数据</text></view>
			<view v-for="(item, index) in data[select]" :key="index" class="item">
				<view class="item_top p24">
					<view class="item_top_left"><text>瑕疵图片</text></view>
					<view class="id">ID :{{ item.bar_id }}</view>
				</view>
				<view class="imgs">
					<scroll-view scroll-x="true" enable-flex="true" style="white-space: nowrap;">
						<view v-for="(itm, idx) in item.original_image" @tap="bigImg" :data-list="item.original_image" :data-index="idx"
						 :key="idx" class="img_item">
							<image class="icon" :src="itm + '-thumb'"></image>
						</view>
					</scroll-view>
				</view>
				<view class="item_footer p24">
					<view class="price">处理费用 (￥{{ item.price }})</view>
				</view>
				<view class="price_info">
					<text>{{ item.scheme === null ? '暂无方案' : item.scheme }}</text>
					<text>{{ item.created_at }}</text>
				</view>
				<!-- 处理后图片 -->
				<view class="handle_after p24">
					<view class="hanle_title">
						<view class="handle_after_title">处理后图片</view>
					</view>
					<view class="imgs">
						<scroll-view scroll-x="true" enable-flex="true" style="white-space: nowrap;">
							<view v-for="(it, idx) in item.end_image" @tap="bigImg" :data-list="item.end_image" :data-index="idx" :key="idx"
							 class="img_item">
								<image class="icon" :src="it + '-thumb'"></image>
							</view>
						</scroll-view>
					</view>
				</view>
				<view class="hanle_title_buttom p24" style="display: none;">
					<picker class="handle_after_title edit-order" mode="selector" :range="consignorArr" @change="changeConsignor">
						<view>修改订单</view>
					</picker>
					<view class="handle_after_title edit-order" @tap="editOrder" :data-id="item.id" :data-consignorid="item.consignor_id" :data-barid="item.bar_id">
						修改订单
					</view>
					<view class="handle_after_title detele-order" @tap="deleteOrder" :data-id="item.id" :data-consignorid="item.consignor_id" :data-barid="item.bar_id">
						删除订单
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '../../utils/request.js';
	const is_page = getCurrentPages();

	export default {
		data() {
			return {
				user: {},
				data: {
					s3_xi: [],
					s3_xiu: [],
					s5: []
				},
				info_data: [],
				nav: [{
						name: '已清洗',
						id: 's3_xi',
						num: '',
						page: 1
					},
					{
						name: '已修复',
						id: 's3_xiu',
						num: '',
						page: 1
					},
					{
						name: '待退回',
						id: 's5',
						num: '',
						page: 1
					}
				],
				priceArr: ['10', '20', '30', '40', '50'],
				select: 's3_xi', // 顶部导航条状态
				selectIndex: 0,
				is_lookInfo: false, // 已退回页是否为查看详情
				await_return_select: 1, // 待退回筛选
				showBtn: false, //底部弹出框
				is_num: 0, //选中的数量
				all_price: 0, //选中的价格
				is_all_select: false, // 是否全选
				unable_num: 0, // 不可修复数量
				is_select_num: 0, // 已选退回数量
				price_select: 10,
				page: 1,
				count: '', //订单数量
				code: '', //已退回的code
				consignorArr: []
			};
		},
		methods: {
			changeConsignor(e) {
				console.log(e);
			},
			editOrder(e) {
				const {id,consignorid,barid} = e.currentTarget.dataset;
				request('/api/auth/setOther', 'POST', {
					id,
					consignor_id: consignorid,
					bar_id: barid
				}).then((res) => {
					console.log(res);
				});
				console.log(id, consignorid, barid);
			},
			deleteOrder(e) {},
			getCount() {
				request('/auth/getCount', 'POST', {
					consignor_id: this.user.id
				}).then(res => {
					let data = res.data;
					for (let key in data) {
						this.nav.map(item => {
							if (item.id === key) {
								item.num = data[key];
							}
						});
					}
				});
			},
			// 查看大图
			bigImg(e) {
				let {
					index,
					list
				} = e.currentTarget.dataset;
				uni.previewImage({
					current: list[index], // 当前显示图片的http链接
					urls: list // 需要预览的图片http链接列表
				});
			},
			// 获取数据
			getData(states, page) {
				uni.showLoading({
					title: '加载中...'
				});
				let user = JSON.parse(uni.getStorageSync('user'));
				request('/api/auth/orderList', 'POST', {
					states,
					consignor_id: user.id,
					page: this.page
				}).then(res => {
					uni.hideLoading();
					if (res.data.data.length == 0) {
						uni.showToast({
							title: '暂无数据可加载',
							icon: 'none'
						});
						this.nav[this.selectIndex].page -= 1;
						return;
					}
					const s3_xi = [],
						s3_xiu = [],
						s5 = [];
					res.data.data.forEach(item => {
						item.end_image = JSON.parse(item.end_image);
						item.original_image = JSON.parse(item.original_image);
						if (item.s3_xi) {
							s3_xi.push(item);
						}
						if (item.s5_xiu) {
							s5_xiu.push(item);
						}
						if (item.states === 5) {
							s5.push(item);
						}
					});
					this.data.s3_xi = s3_xi;
					this.data.s3_xiu = s3_xiu;
					this.data.s5 = s5;
					uni.hideNavigationBarLoading();
					uni.stopPullDownRefresh();
				});
			},
			// 重置页面
			resetPage() {
				this.getCount();
				uni.hideNavigationBarLoading();
				uni.stopPullDownRefresh();
			},
			// 切换顶部nav
			change_nav(e) {
				let index = e.currentTarget.dataset.index;
				// let page = e.currentTarget.dataset.page;
				let selectIndex = e.currentTarget.dataset.selectindex;
				console.log(selectIndex, index);
				this.selectIndex = selectIndex;
				this.page = this.nav[selectIndex].page;
				if (index == this.select) {
					return;
				}
				this.select = index;
				// this.resetPage();
				switch (index) {
					case 's3_xi':
						this.getCount();
						this.getData(3, this.page);
						break;
					case 's3_xiu':
						this.getCount();
						this.getData(3, this.page);
						break;
					case 's5':
						this.getCount();
						this.getData(5, this.page);
						break;
					default:
						break;
				}
			}
		},
		onPullDownRefresh: function() {
			uni.showNavigationBarLoading();
			this.page = 1;
			this.getCount();
			if (this.select === 's3_xi' || this.select === 's3_xiu') {
				this.getData(3);
			} else {
				this.getData(5);
			}
		},
		// 页面触底
		onReachBottom() {
			let index = this.select;
			let selectIndex = this.selectIndex;
			this.nav[selectIndex].page++;
			this.page = this.nav[selectIndex].page;
			switch (index) {
				case 's3_xi':
					this.getCount();
					this.getData(3, this.page);
					break;
				case 's3_xiu':
					this.getCount();
					this.getData(3, this.page);
					break;
				case 's5':
					this.getCount();
					this.getData(5, this.page);
					break;
				default:
					break;
			}
		},
		onLoad() {
			let user = JSON.parse(uni.getStorageSync('user'));
			this.user = user;
			this.price_select = Number(user.quota);
			this.getData(3);
			this.getCount();
			const owner_id = JSON.parse(uni.getStorageSync('user'))['owner_id'];
			request('/api/auth/getConsignor', 'post', {
				owner_id
			}).then(res => {
				res.data.forEach(item => {
					this.consignorArr.push(item.username);
				});
			});
		}
	};
</script>

<style>
	page {
		padding-top: 90rpx;
	}

	.title {
		padding: 19rpx 0 0 25rpx;
		font-family: PingFangSC-Regular;
		font-size: 22rpx;
		color: #666;
	}

	.item {
		background: #fff;
		margin-top: 18rpx;
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

	.item_footer {
		/* padding:  0 24rpx; */
	}

	.price {
		font-family: PingFangSC-Regular;
		line-height: 36rpx;
		color: #3748f9;
		border-top: 2rpx dashed #f5f4f9;
		border-bottom: 2rpx dashed #f5f4f9;
		height: 76rpx;
		display: flex;
		align-items: center;
	}

	.price_info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		line-height: 40rpx;
		font-family: PingFangSC-Regular;
		font-size: 26rpx;
		color: #000;
		padding: 20rpx;
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

	.footer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
	}

	.setting {
		position: absolute;
		/* top: -175rpx; */
		background-color: #fff;
		box-shadow: 0px 0px 9px 0px rgba(8, 7, 18, 0.29);
		border-radius: 20rpx;
		right: 24rpx;
	}

	.setting .btn {
		padding: 24rpx;
	}

	.main {
		display: flex;
		align-items: center;
		height: 110rpx;
		justify-content: space-between;
		padding: 0 24rpx;
		border-top: 2rpx solid #f5f4f9;
	}

	.all_select {
		display: flex;
		align-items: center;
	}

	.all_price {
		color: #3748f9;
	}

	.all_button {
		width: 180rpx;
		height: 80rpx;
		background-color: #3745f9;
		border-radius: 40px;
		text-align: center;
		line-height: 80rpx;
		color: #fff;
	}

	/* nav  */

	.nav {
		height: 96rpx;
		padding: 0 24rpx;
		background: #fff;
		font-family: PingFangSC-Regular;
		font-size: 26rpx;
		color: #000;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 999;
		width: 100%;
		box-sizing: border-box;
	}

	.nav .nav_item {
		display: inline-block;
		position: relative;
		text-align: center;
		width: 33.33333%;
		line-height: 90rpx;
	}

	.nav_item.active {
		/* background: #3745f9; */
		border-bottom: 6rpx solid #3745f9;
	}

	/* 处理后图片 */

	.handle_after {}

	.handle_after_title {
		height: 65rpx;
		line-height: 65rpx;
		border-top: 2rpx solid #f5f4f9;
		font-family: PingFangSC-Semibold;
		font-size: 24rpx;
		color: #000;
	}

	/* 待退回 */

	.await_return_select {
		height: 60rpx;
		display: flex;
		background: #fff;
		justify-content: space-around;
		align-items: center;
		font-family: PingFangSC-Regular;
		font-size: 26rpx;
	}

	.await_return_select>.active {
		color: #3748f9;
	}

	/* 已退回订单列表 */

	.is_return {
		margin-top: 18rpx;
	}

	.is_return .order_list .order_list_item {
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 138rpx;
		border-bottom: 2rpx solid #f5f4f9;
	}

	.order_list_item_left {
		display: flex;
	}

	.is_return .order_list .order_list_item .order_num {
		margin-right: 40rpx;
	}

	.is_return .order_list .order_list_item .look_info {
		color: #3748f9;
	}

	/* 已退回订单详情 */

	.order_info_header {
		margin-top: 18rpx;
		display: flex;
		align-items: center;
		background: #fff;
		height: 90rpx;
		justify-content: space-between;
	}

	.order_info_title {
		display: flex;
	}

	.order_info_header .change_select {
		padding-right: 20rpx;
		color: #3748f9;
	}

	.order_info_return_num {
		margin-right: 40rpx;
	}

	.oder_info_item {
		background: #fff;
		margin-top: 19rpx;
	}

	.oder_info_item .top {
		display: flex;
		align-items: center;
		height: 69rpx;
		justify-content: space-between;
	}

	/* 设置 */

	.is_setting {
		padding: 20rpx;
	}

	.setting_card {
		background: #fff;
		margin-top: 19rpx;
		border-radius: 16rpx;
		text-align: center;
		padding: 39rpx 20rpx 32rpx 20rpx;
	}

	.setting_card .top {
		margin-bottom: 64rpx;
		font-family: PingFangSC-Semibold;
		font-size: 26rpx;
		color: #000;
		font-weight: bold;
	}

	.setting_card .price_list {
		display: flex;
		justify-content: space-around;
	}

	.setting_card .price_list>view {
		width: 126rpx;
		height: 80rpx;
		background-color: #eaedf6;
		border-radius: 6rpx;
		line-height: 80rpx;
	}

	.setting_card .price_list>view.active {
		background-color: #3748f9;
		color: #fff;
	}

	.is_setting_footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #fff;
		padding: 20rpx;
	}

	.is_setting_footer button {
		background-color: #3745f9;
		border-radius: 40px;
		color: #fff;
	}

	.no-data {
		height: 144rpx;
		line-height: 144rpx;
		text-align: center;
	}

	.hanle_title_buttom {
		text-align: right;
	}
	
	.edit-order,.detele-order {
		color: #FFFFFF;
		border-radius: 6rpx;
		padding: 0 15rpx;
		margin-left: 24rpx;
		display: inline-block;
	}
	
	.edit-order {
		background-color: #3151ff;
	}
	
	.detele-order {
		background-color: #f56c6c;
	}
</style>
