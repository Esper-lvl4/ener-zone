<template>
	<div class="room-wrap">
		<div class="room-player-list block-style">
			<!-- Output players -->
			<h2>List of players:</h2>
			<div v-for="player in users.players" class="room-player">
				<span>{{player.nickname}} </span><span>({{player.role}})</span><span>: {{player.ready ? 'ready' : 'not ready'}}</span>
			</div>
			<h2>List of spectators</h2>
			<div v-for="player in users.spectators" class="room-player">
				<span>{{player.nickname}} </span><span>({{player.role}})</span>
			</div>
		</div>
		<div class="room-ex-buttons block-style">
			<button class="main-button" v-if="userIsRoomPlayer" :disabled="!readyToStart" @click="open()">OPEN!</button>
			<button class="main-button" @click="readyToPlay()" v-if="userIsRoomPlayer">Ready to batoru</button>
			<button class="main-button" v-if="userIsRoomPlayer" @click="openLoadModal">Choose deck</button>
			<button class="main-button"  v-if="userIsRoomPlayer">Invite</button>
			<button class="main-button" v-if="userIsRoomHost">Kick</button>
			<button class="main-button" v-if="userIsRoomHost" @click="closeRoom()">Close room</button>
			<button class="main-button" @click="leaveRoom()">Leave room</button>
		</div>

		<LoadDeck v-if="loadDeckModal" @close-modal="closeModals" />
	</div>
</template>
<script>
import LoadDeck from './../components/Load_Deck.vue';

export default {
  name: "game-room",
	components: { LoadDeck },
	props: [
		'currentRoom'
	],
	sockets: {
		loadedDeck(deck) {
      this.deckName = deck.name;

			this.$socket.emit('playerReadiness', false);
    },
	},
	data() {
		return {
			numberOfPlayers: 2,
			loadDeckModal: false,

			deckName: '',
		}
	},
  computed: {
		room() {
			return this.currentRoom;
		},
		role() {
			for (let user of this.room.players) {
				if (user.nickname == localStorage.getItem('Nickname')) {
					return 'player';
					break;
				}
			}
			for (let user of this.room.spectators) {
				if (user.nickname == localStorage.getItem('Nickname')) {
					return 'spectator';
					break;
				}
			}
			return '';
		},
		users() {
			return {players: this.room.players, spectators: this.room.spectators};
		},
		userIsRoomHost: function () {
			return this.role == 'host';
		},
		userIsRoomPlayer: function () {
			return this.role == 'player' || this.userIsRoomHost;
		},
		userIsRoomSpectator: function () {
			return this.role == 'spectator';
		},
		deckIsValid () {
			return false;
		},
		readyToStart() {
			if (this.users.players.length == this.numberOfPlayers) {
				let result = true;
				for (let player of this.users.players) {
					if (player.ready === false) {
						result = false
					}
				}
				return result;
			} else {
				return false;
			}
		}
  },
	methods: {
		closeRoom: function () {
			this.$socket.emit('closeRoom');
		},
		leaveRoom: function () {
			this.$socket.emit('leaveRoom');
		},
		readyToPlay: function () {
			if (this.deckName !== '' && deckIsValid) {
				this.$socket.emit('playerReadiness');
			}
		},
		open: function () {
			if (this.readyToStart === true) {
				this.$socket.emit('initGame', this.currentRoom.id);
			}
		},

		openLoadModal() {
			this.loadDeckModal = true;
		},
		closeModals() {
      this.loadDeckModal = false;
		}
	},
}
</script>
