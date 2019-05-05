import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use(Vuex);
export const store = new Vuex.Store({
	state: {
		isLoggedIn: false,
		database: null,
		filteredDatabase: null,
		userDecks: null,
		chat: [],
		gameRooms: [],
		errorMessage: '',
	},
	getters: {},
	mutations: {
		manageLogin(state, changeTo) {
			state.isLoggedIn = changeTo;
		},
		saveDatabase(state, database) {
			state.database = database;
		},
		saveDecks(state, decks) {
			state.userDecks = decks;
		},
		filterDatabase(state, result) {
			state.filteredDatabase = result;
		},
		errorMessage(state, err) {
			state.errorMessage = err;
		},
		clearErrors(state) {
			state.errorMessage = '';
		},
	},
	actions: {},
});
