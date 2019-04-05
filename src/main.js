import Vue from 'vue'
import App from './App.vue'
/*import io from 'socket.io-client'

var socket = io('/main-menu', {
	query: {
		token: localStorage.getItem('EnerZoneToken'),
	},
});*/

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
