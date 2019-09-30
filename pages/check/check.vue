<template>
	<view class="contacts">
		<view class='top'>
			<view class='search_main'>
				<view class='icon_box'>
					<image src="../../static/images/search.png"></image>
				</view>
				<input v-model='name' placeholder='搜索'></input>
			</view>
		</view>
		<view class='main'>
			<scroll-view @scroll="is_scroll" scroll-y :scroll-into-view="lid" class='user_list' :style="{height: height}">
				<view v-for="(item, index) in data" :lid="'user'+index" :key="index" class='every'>
					<view class='title'>{{item.title}}</view>
					<view class='every_users'>
						<view class='user' @tap='go_is_select' v-for="(itm, index) in item.arr" :key="index" :data-username="itm.username" :data-id="itm.id">{{itm.username}}</view>
					</view>
				</view>
			</scroll-view>
			<view class='letter'>
				<view @tap='change_user' v-for="(item, index) in Arr" :key="index" :data-id="'user'+index" class='letter_item'>{{item}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import request from '../../utils/request.js';
	import {
		pinyinUtil
	} from '../../utils/pinyinUtil.js';
	import {mapState, mapMutations} from 'vuex';

	export default {
		data() {
			return {
				name: '',
				data: [],
				search_word: '',
				Arr: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
					'W', 'X', 'Y', 'Z', "#"
				],
				height: 0,
				lid: ''
			}
		},
		onLoad() {
			uni.showLoading({
				title: '加载中...',
				icon: 'none'
			});
			request('/api/auth/consign', 'POST', {
				id: this.id
			}).then(res => {
				uni.hideLoading();
				let data = [...res.data];
				let no_arr = [...res.data];
				console.log(this.Arr);
				let Arr = this.Arr;
				let result_arr = [];
				let is_arr = [];
				data.forEach((item, index) => {
					let str = pinyinUtil.getFirstLetter(item.username, false).substring(0, 1)
					if (Arr.indexOf(str) != -1) {
						no_arr.forEach((i, j) => {
							if (i.id == item.id) {
								console.log()
								is_arr.push(no_arr[j])
							}
						})
					}
				})
				let no_arr_ = this.getArrDifference(is_arr, no_arr);
				Arr.forEach(item => {
					let obj = {};
					obj.title = item;
					obj.arr = [];
					is_arr.forEach(itm => {
						let str = pinyinUtil.getFirstLetter(itm.username, false).substring(0, 1)
						if (str == item) {
							obj.arr.push(itm)
						}
					})
					result_arr.push(obj)
				})
				result_arr[result_arr.length - 1].arr = no_arr_;
				this.data = result_arr;
			});
		},
		computed: {
			...mapState(['id'])
		},
		methods: {
			...mapMutations(['upJSId', 'upJSName']),
			is_scroll() {

			},
			go_is_select(e) {
				let {dataset} = e.currentTarget;
				let {username, id} = dataset;
				this.upJSId(id);
				this.upJSName(username);
				console.log(username);
				uni.navigateTo({
					url: '../repair/repair'
				});
			},
			getValue() {
				let Arr = this.data.Arr;
				let value = this.data.search_word;
				let reg = /^[a-z]/
				let str = '';
				let lid = '';
				if (reg.test(value)) {
					str = value.substring(0, 1).toUpperCase();
				} else {
					str = pinyinUtil.getFirstLetter(value, false).substring(0, 1)
				}
				if (Arr.indexOf(str) != -1) {
					lid = "user" + Arr.indexOf(str);
				} else {
					lid = "user" + (Arr.length - 1)
				}
				this.lid = lid;
			},
			getArrDifference(arr1, arr2) {
				return arr1.concat(arr2).filter(function(v, i, arr) {
					return arr.indexOf(v) === arr.lastIndexOf(v);
				});
			},
			change_user() {
				
			}
		},
		onReady() {
			let view = uni.createSelectorQuery();
			view.select('.contacts').boundingClientRect();
			view.exec();
			view.select('.top').boundingClientRect();
			view.exec((res) => {
				console.log(res);
				let height = 0;
				height = res[0].height - res[1].height;
				this.height = height + 'px';
			});
		}
	}
</script>

<style>
	.contacts {
		background: #fff;
		height: 100vh;
	}

	.main {
		position: relative;
		font-size: 28rpx;
	}

	.letter {
		position: fixed;
		top: 140rpx;
		right: 20rpx;
		width: 40rpx;
		text-align: center;
	}

	.every .title {
		height: 40rpx;
		line-height: 40rpx;
		background: #f4f5f9;
		padding: 0 30rpx;
	}

	.every_users {
		padding: 0 30rpx;
	}

	.every_users>.user:last-child {
		border-bottom: none;
	}

	.user {
		height: 90rpx;
		line-height: 90rpx;
		border-bottom: 2rpx solid #f4f5f9;
	}

	.top {
		background: #fff;
		padding: 16rpx 20rpx;
		height: 100rpx;
	}

	.search_main {
		height: 100%;
		display: flex;
		align-items: center;
		background-color: #f2f2f2;
		border-radius: 16rpx;
		padding-left: 28rpx;
	}

	.search_main .icon_box {
		margin-right: 21rpx;
	}

	.search_main .icon_box image {
		width: 26rpx;
		height: 24rpx;
	}
</style>
