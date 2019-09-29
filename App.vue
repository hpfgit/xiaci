<script>
	import request from 'utils/request.js';
	import {mapMutations} from 'vuex';
	export default {
		methods: {
			...mapMutations(['upId'])
		},
		onLaunch: function() {
			if (!uni.getStorageSync('token')) {
				uni.redirectTo({
					url: 'pages/login/login'
				});
			} else {
				request("/api/auth/me", "POST").then(res => {
					uni.setStorageSync("user", JSON.stringify(res.data));
					let id = res.data.id;
					this.upId(id);
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
				});
			}
			console.log('App Launch');
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import './static/css/style.css';
</style>
