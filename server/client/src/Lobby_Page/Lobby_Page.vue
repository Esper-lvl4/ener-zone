<template>
  <div id="lobby">
		<div class="lobby-wrap">
			<div class="lobby-list-block">
				<div class="lobby-filter-wrap block-style" :class="{'js-none': currentRoom}">
					<input class="lobby-name-filter main-input"type="text" name="name-filter" id="name-filter">
					<div class="progress-filter-wrap">
						<input type="checkbox" name="progress-filter" id="progress-filter" placeholder="Search for rooms by name">
						<label for="progress-filter">Show rooms, where game has started.</label>
					</div>
					<button class="filters-modal-button main-button" @click="toggleModal('filter')">Filters</button>
				</div>

				<GameRoom v-if="currentRoom" :currentRoom="currentRoom" />
				<div class="lobby-gamelist-wrap block-style" v-else @click.self="unselectRoom()">
					<!-- Output list of rooms -->
					<ul class="game-list" @click.stop="selectRoom($event.target)">
						<li v-for="room in gameRooms" :id="'room-' + room.id" :class="{'js-selected-room': selectedRoom == room}">{{room.name}}</li>
					</ul>
				</div>

				<div class="lobby-buttons-wrap block-style" :class="{'js-none': currentRoom}">
					<button class="main-button" @click="toggleModal('create')">Create</button>
					<button class="main-button" :disabled="!roomIsSelected" @click="joinButtonClick()">Join</button>
					<button class="main-button" :disabled="!roomIsSelected" @click="spectateRoom()">Spectate</button>
					<button class="main-button" disabled @click="toggleModal('friends')">Friends</button>
					<router-link class="main-button" to="/deck-editor/" tag="button">Decks</router-link>
				</div>
			</div>
			<ChatModule />
		</div>
		<Modal v-if="showModal" @closed-modal="toggleModal()">
			<CreateRoom v-if="createRoomModal" />
			<PasswordGame v-if="passwordModal" :room="selectedRoom" @join-room="joinRoom($event)"/>
			<GameFilter v-if="filterModal" />
			<FriendList v-if="friendListModal" />
		</Modal>
  </div>
</template>

<script>
import CreateRoom from './Create_Room.vue';
import FriendList from './Friend_List.vue';
import GameFilter from './Game_Filter.vue';
import PasswordGame from './Password_Game.vue';
import GameRoom from './Game_Room.vue';

import Modal from './../components/Modal.vue';
import ChatModule from './../components/Chat_Module.vue';

export default {
  name: 'lobby',
	components: {
		CreateRoom, FriendList, GameFilter, PasswordGame, GameRoom, Modal, ChatModule
	},
	sockets: {
		restoreRoom (room) {
			console.log('restore');
			console.log(room);
			this.initRoom(room);
		},
		refreshLobby (data) {
			if (!data) {
				console.log('No game data were sent by server!');
				return;
			}
			this.gameRooms = data;
			console.log(this.gameRooms);
		},
		joiningRoom (room) {
			this.initRoom(room);
		},
		closedRoom() {
			this.resetLobby();
		},
		refreshRoom(room) {
			this.$store.commit('changeCurrentRoom', room);
		},
		leftRoom() {
			this.resetLobby();
		},
		failedRoomCreation(message) {
			console.log(message);
		},
	},
  data(){
		return {
			// Lobby props
			gameRooms: [],
			selectedRoom: null,

			// Modals props
			showModal: false,
			createRoomModal: false,
			passwordModal: false,
			filterModal: false,
			friendListModal: false,
		}
	},
	methods: {

		// Dom manipulation methods
		toggleModal(modal) {
			if (modal) {
				this.showModal = true;
			} else {
				this.showModal = false;
				return;
			}
			this.createRoomModal = false;
			this.passwordModal = false;
			this.filterModal = false;
			this.friendListModal = false;
			if (modal == 'password') {
				this.passwordModal = true;
			} else if (modal == 'create') {
				this.createRoomModal = true;
			} else if (modal == 'filter') {
				this.filterModal = true;
			} else if (modal == 'friends') {
				this.friendListModal = true;
			}
		},
		initRoom(room) {
			this.toggleModal();
			this.$store.commit('changeCurrentRoom', room);
			console.log('init');
			console.log(room);
		},
		resetLobby() {
			this.toggleModal();
			this.$store.commit('changeCurrentRoom', null);
		},
		unselectRoom() {
			this.selectedRoom = null;
		},
		joinButtonClick() {
			if (this.selectedRoom.settings.password === '') {
				this.joinRoom('player');
			} else {
				this.toggleModal('password');
			}
		},
		selectRoom(target) {
			if (target) {
				this.selectedRoom = this.getRoom(target.id.replace('room-', ''));
			} else {
				this.selectedRoom = null;
			}
		},
		getRoom(id) {
			for (let room of this.gameRooms) {
				if (room.id === id) {
					return room;
				}
			}
		},

		// Socket emits(lobby).
		joinRoom(role) {
			this.$socket.emit('joinRoom', {id: this.selectedRoom.id, role: role});
		},
		spectateRoom() {
			this.$socket.emit('joinRoom', {id: this.selectedRoom.id, role: 'spectator'});
		},
	},
	computed: {
		roomIsSelected() {
			return this.selectedRoom ? true : false;
		},
		currentRoom() {
			return this.$store.state.currentRoom;
		}
	},
	mounted() {
		this.$socket.emit('getGameList');
	},
}
</script>
