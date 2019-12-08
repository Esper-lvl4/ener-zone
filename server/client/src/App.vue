<template>
  <div class="global-wrap" id="app" :style="'background: url(/src/assets/backgrounds/' + backgroundImage + ') 50% 50%/cover no-repeat'">
		<Modal v-if="errorOccured" @closed-modal="clearErrors" :ok="true"></Modal>
    <MainMenu/>
    <div class="global-size">
      <div class="global-main">
        <router-view v-if="isLoggedIn"></router-view>
        <AuthPage v-else/>
      </div>
    </div>
  </div>
</template>

<script>
import VueRouter from 'vue-router'
import Modal from './components/Modal.vue'

import MainMenu from './Main_Menu/Main_Menu.vue'
import LobbyPage from './Lobby_Page/Lobby_Page.vue'
import GamePage from './Game_Page/Game_Page.vue'
import DeckEditor from './Deck_Editor/Deck_Editor.vue'
import OptionsPage from './Options_Page/Options_Page.vue'
import ProfilePage from './Profile_Page/Profile_Page.vue'
import AdminPage from './Admin_Page/Admin_Page.vue'
import AuthPage from './Auth_Page/Auth_Page.vue'

const router = new VueRouter({
  routes: [
    {path: '/', component: LobbyPage},
    {path: '/lobby/', component: LobbyPage},
    {path: '/game/', component: GamePage},
    {path: '/deck-editor/', component: DeckEditor},
    {path: '/options/', component: OptionsPage},
    {path: '/profile/', component: ProfilePage},
    {path: '/admin/', component: AdminPage},
  ],
  mode: 'history',
});

export default {
  name: 'app',
  router,
  components: {
    MainMenu, LobbyPage, GamePage, DeckEditor, OptionsPage, ProfilePage, AdminPage, AuthPage, Modal
  },
  sockets: {
		accessVerify(result) {
			this.$store.commit('manageLogin', result);
		},
		successLogout() {
			this.$store.commit('manageLogin', false);
			localStorage.removeItem('Nickname');
			localStorage.removeItem('EnerZoneToken');
		},
    errorMessage(err) {
      this.$store.commit('errorMessage', err);
    },
    loginSuccess() {
      this.$store.commit('manageLogin', true);
    },
		restoreGame(room) {
			console.log(room);
			this.$store.commit('changeCurrentRoom', room);
			if (!this.$route.path.match('game')) {
				this.$router.push({path: '/game/'});
			}
		},
		leftGame() {
			this.$store.commit('changeCurrentRoom', null);
			if (!this.$route.path.match('lobby')) {
				this.$router.push('lobby');
			}
		},
		restoreRoom(room) {
      console.log(room);
			this.$router.push('lobby');
			this.$store.commit('changeCurrentRoom', room);
		},
  },
  data() {
    return {
      backgroundImage: 'Dont_Act.jpg',
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.state.isLoggedIn;
    },
		errorOccured () {
			let msg = this.$store.state.errorMessage;
			if (!msg) return false;
			return msg;
		},
  },
	methods: {
		clearErrors() {
			this.$store.commit('clearErrors');
		}
	},
	mounted() {
		console.log('check');
		this.$socket.emit('checkUserLocation', 'check');
	}
}
</script>
