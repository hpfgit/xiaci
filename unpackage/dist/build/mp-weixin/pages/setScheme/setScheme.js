(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/setScheme/setScheme"],{"01aa":function(e,t,c){"use strict";c.r(t);var n=c("6e85"),i=c("882b");for(var a in i)"default"!==a&&function(e){c.d(t,e,function(){return i[e]})}(a);c("b5a8");var o=c("2877"),s=Object(o["a"])(i["default"],n["a"],n["b"],!1,null,null,null);t["default"]=s.exports},"2f35":function(e,t,c){"use strict";(function(e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=a(c("f2b5")),i=c("2f62");function a(e){return e&&e.__esModule?e:{default:e}}function o(e){for(var t=1;t<arguments.length;t++){var c=null!=arguments[t]?arguments[t]:{},n=Object.keys(c);"function"===typeof Object.getOwnPropertySymbols&&(n=n.concat(Object.getOwnPropertySymbols(c).filter(function(e){return Object.getOwnPropertyDescriptor(c,e).enumerable}))),n.forEach(function(t){s(e,t,c[t])})}return e}function s(e,t,c){return t in e?Object.defineProperty(e,t,{value:c,enumerable:!0,configurable:!0,writable:!0}):e[t]=c,e}var u={data:function(){return{checked:[],totalPrice:0,scheme:[]}},computed:o({},(0,i.mapState)(["shapecode","jsId"])),onLoad:function(){var t=this;e.showLoading({title:"加载中..."}),(0,n.default)("/api/auth/tabLists","POST",{}).then(function(c){console.log(c.data.data),c.data.data.forEach(function(e){e.num=0,e.totalPrice=0,e.checked=!1}),t.scheme=c.data.data,e.hideLoading()}),(0,n.default)("/api/auth/getOrder","POST",{bar_id:this.shapecode}).then(function(e){t.upJSId(e.data[0].consignor_id),console.log(e)})},methods:o({},(0,i.mapMutations)(["upJSId"]),{add:function(e){var t=this,c=e.currentTarget.dataset.index,n=[];this.scheme[c].num+=1,0===c&&(this.scheme[c].num=1),2===c&&(this.scheme[c].num=1),this.scheme[c].checked=!0,this.scheme[c].totalPrice=this.scheme[c].num*this.scheme[c].price,this.totalPrice=0,this.scheme.forEach(function(e){t.totalPrice+=e.totalPrice,e.checked&&n.push(e)}),this.checked=n},reduce:function(e){var t=e.currentTarget.dataset.index,c=[];if(this.scheme[t].num<=1&&!1!==this.scheme[t].checked)return this.scheme[t].num=0,this.scheme[t].totalPrice=this.scheme[t].num*this.scheme[t].price,this.totalPrice-=this.scheme[t].price,this.scheme[t].checked=!1,this.scheme.forEach(function(e){e.checked&&c.push(e)}),this.checked=c,void console.log(this.checked,t);this.scheme[t].num<=1||(this.scheme[t].num-=1,this.scheme[t].totalPrice=this.scheme[t].num*this.scheme[t].price,this.totalPrice-=this.scheme[t].price)},setSubmit:function(){if(this.checked.length<=0)e.showToast({title:"至少选择一个方案",icon:"none"});else{e.showLoading({title:"加载中..."});var t="",c="";this.scheme.forEach(function(e){0!==e.num&&(t+="".concat(e.title," ￥").concat(e.price,"*").concat(e.num," "),c+=",".concat(e.id))}),c+=",",(0,n.default)("/api/auth/scheme","POST",{scheme:t,tab_ids:c,bar_id:this.shapecode,user_id:this.jsId,price:this.totalPrice}).then(function(t){console.log(t),e.hideLoading(),e.showToast({title:"设置成功",icon:"none",duration:2e3,complete:function(){setTimeout(function(){e.navigateTo({url:"../sweep/sweep"})},1e3)}})}).catch(function(t){e.hideLoading(),e.showToast({title:"设置失败",icon:"none"})})}}})};t.default=u}).call(this,c("543d")["default"])},6923:function(e,t,c){},"6e85":function(e,t,c){"use strict";var n=function(){var e=this,t=e.$createElement;e._self._c},i=[];c.d(t,"a",function(){return n}),c.d(t,"b",function(){return i})},"882b":function(e,t,c){"use strict";c.r(t);var n=c("2f35"),i=c.n(n);for(var a in n)"default"!==a&&function(e){c.d(t,e,function(){return n[e]})}(a);t["default"]=i.a},b5a8:function(e,t,c){"use strict";var n=c("6923"),i=c.n(n);i.a},d27f:function(e,t,c){"use strict";(function(e){c("c424"),c("921b");n(c("66fd"));var t=n(c("01aa"));function n(e){return e&&e.__esModule?e:{default:e}}e(t.default)}).call(this,c("543d")["createPage"])}},[["d27f","common/runtime","common/vendor"]]]);