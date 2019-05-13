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
			<button class="main-button" v-if="userIsRoomPlayer">Choose deck</button>
			<button class="main-button"  v-if="userIsRoomPlayer">Invite</button>
			<button class="main-button" v-if="userIsRoomHost">Kick</button>
			<button class="main-button" v-if="userIsRoomHost" @click="closeRoom()">Close room</button>
			<button class="main-button" @click="leaveRoom()">Leave room</button>
		</div>
	</div>
</template>
<script>
export default {
  name: "game-room",
	props: [
		'currentRoom'
	],
	data() {
		return {
			numberOfPlayers: 2,
		}
	},
  computed: {
		room() {
			return this.currentRoom;
		},
		role() {
			for (let user of this.room.users) {
				if (user.nickname == localStorage.getItem('Nickname')) {
					return user.role;
					break;
				}
			}
			return '';
		},
		users() {
			let players = [];
			let spectators = [];
			for (let i = 0; i < this.room.users.length; i++) {
				if (this.room.users[i].role === 'player' || this.room.users[i].role === 'host') {
					players.push(this.room.users[i]);
				} else if (this.room.users[i].role === 'spectator') {
					spectators.push(this.room.users[i]);
				}
			}
			return {players, spectators};
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
			this.$socket.emit('closeRoom', 'close pls');
		},
		leaveRoom: function () {
			this.$socket.emit('leaveRoom', 'leave pls');
		},
		readyToPlay: function () {
			this.$socket.emit('playerReadiness');
		},
		open: function () {
			if (this.readyToStart === true) {
				this.$socket.emit('initGame', this.currentRoom.id);
			}
		},
	},
}
</script>
