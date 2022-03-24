import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';


import VueAMap from '@vuemap/vue-amap';
import '@vuemap/vue-amap/dist/style.css'
Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
	key: '2e8a6fdb3469d427e0dbffebaa2dec07',
});

window._AMapSecurityConfig = {
	securityJsCode: 'f981d7cc7be5bdae3f9eba9914a754fe',
}
Vue.config.productionTip = false

Vue.use(ElementUI);

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')
