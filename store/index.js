import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const loginIdKey = 'loginId';
const jsIdKey = 'jsId';
const store = new Vuex.Store({
    state: {
        id: '',
		jsId: '',
		jsName: '',
		shapecode: '',
		expireTime: '',
		token: '',
		expireIn: '',
		expireTime: '',
		tokenType: ''
    },
    mutations: {
        upId(state, id) {
            state.id = id;
			// uni.setStorageSync(loginIdKey, id);
        },
		upJSId(state, jsId) {
			state.jsId = jsId;
			// uni.setStorageSync(jsIdKey, jsId);
		},
		upJSName(state, name) {
			state.jsName = name;
			// uni.setStorageSync('JSName', name);
		},
		upShapeCode(state, shapecode) {
			state.shapecode = shapecode;
			// uni.setStorageSync('shapecode', shapecode);
		},
		expireTime(state, time) {
			state.expireTime = time;
			uni.setStorageSync('expireTime', time);
		},
		upToken(state, token) {
			state.token = token;
			uni.setStorageSync('token', token);
		},
		expireIn(state, time) {
			state.expireIn = time;
			uni.setStorageSync('expireIn', time);
		},
		tokenType(state, type) {
			state.tokenType = type;
			uni.setStorageSync('tokenType', type);
		}
    }
})

export default store