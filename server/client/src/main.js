import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSocketIo from 'vue-socket.io'

import App from './App.vue'
import { store } from './store'

import './assets/styles.styl'

Vue.use(VueRouter);
Vue.use(new VueSocketIo({
	debug: true,
	connection: 'http://localhost:5000',
	vuex: {
		store,
		actionPrefix: 'SOCKET_',
		mutationPrefix: 'SOCKET_',
	},
	options: {
		query: {
			token: localStorage.getItem('EnerZoneToken'),
		},
	}
}));
Vue.use(require('vue-moment'));

new Vue({
  el: '#app',
  store,
  render: h => h(App)
});
