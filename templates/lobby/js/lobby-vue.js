(function(){
	// Initialize everything nessesary.
	// Socket.io
	var socket = io('/lobby', {
		query: {
			token: localStorage.getItem('EnerZoneToken'),
		},
	});
	console.log(socket);

	var globalObject = new Vue({
		el: '#app',
		data: {
			// Lobby props
			gameRooms: [],
			selectedRoom: null,
			roomCreationObj: {
				name: '',
				settings: {
					format: 'as',
					timeLimit: '180',
					password: '',
				},
			},

			// Room props
			roomActive: false,
			currentRoom: null,
			currentRoomRole: '',
			currentRoomPlayers: [],
			currentRoomSpectators: [],
			readiness: false,

			// Modals props
			showModal: false,
			createRoomModal: false,
			passwordModal: false,
			filterModal: false,
			friendListModal: false,
		},
		methods: {

			// Dom manipulation methods

			toggleModal: function (modal) {
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
			initRoom: function (room) {
				this.toggleModal();
				this.roomActive = true;
				this.currentRoom = room;
				this.refreshRoom(room);
			},
			returnToLobby: function () {
				this.toggleModal();
				this.roomActive = false;
				this.currentRoom = null;
			},
			unselectRoom: function () {
				this.selectedRoom = null;
			},
			joinButtonClick: function () {
				if (this.selectedRoom.settings.password === '') {
					this.joinRoom('player');
				} else {
					this.toggleModal('password');
				}
			},
			checkRoomPassword: function (event) {
				if (event.target[0].value === this.selectedRoom.settings.password) {
					this.joinRoom('player');
				} else {
					alert('Wrong password');
					this.toggleModal();
				}
			},

			// Socket emits.

			createRoom: function () {
				socket.emit('create-room', this.roomCreationObj);
			},
			joinRoom: function (role) {
				socket.emit('join-room', {id: this.selectedRoom.id, role: role});
			},
			spectateRoom: function () {
				socket.emit('join-room', {id: this.selectedRoom.id, role: 'spectator'});
			},
			closeRoom: function () {
				socket.emit('close-room', 'close pls');
			},
			leaveRoom: function () {
				socket.emit('leave-room', 'leave pls');
			},
			readyToPlay: function () {
				socket.emit('player-readiness', !this.readiness);
			},

			// socket events handlers.

			restoreRoom: function (room, role, rdy) {
				this.initRoom(room);
				this.currentRoomRole = role;
				if (rdy !== undefined) {
					this.readiness = rdy;
				}
				console.log(room);
			},
			refreshLobby: function (data) {
				if (!data) {
					console.log('No game data were sent by server!');
					return;
				}
				this.gameRooms = data.rooms;
				console.log(this.gameRooms);

				chatHistory =	data.history;
			},
			joiningRoom: function (room, role) {
				console.log(room);
				this.currentRoomRole = role;
				this.initRoom(room);
			},
			closedRoom: function (room) {
				this.returnToLobby(room);
			},
			refreshRoom: function (room, rdy) {
				this.currentRoom = room;
				this.currentRoomPlayers = [];
				this.currentRoomSpectators = [];
				if (rdy !== undefined) {
					this.readiness = rdy;
				}
				console.log(this.readiness);
				for (let i = 0; i < room.users.length; i++) {
					if (room.users[i].role === 'player' || room.users[i].role === 'host') {
						this.currentRoomPlayers.push(room.users[i]);
					} else if (room.users[i].role === 'spectator') {
						this.currentRoomSpectators.push(room.users[i]);
					}
				}
			},
			leftRoom: function () {
				this.returnToLobby();
			},

			// Socket Error handlers. 

			failedRoomCreation: function (message) {
				console.log(message);
			},
			errorMessage: function (message) {
				console.log(message);
			},
			init: function () {
				socket.emit('check-user-location', 'check');

				socket.on('restore-room', this.restoreRoom);
				socket.on('refresh-lobby', this.refreshLobby);
				socket.on('joining-room', this.joiningRoom);
				socket.on('closed-room', this.closedRoom);
				socket.on('refresh-room', this.refreshRoom);
				socket.on('left-room', this.leftRoom);

				socket.on('failed-room-creation', this.failedRoomCreation);
				socket.on('error-message', this.errorMessage);


				socket.on('failed-auth', (message) => {
					window.location.href = '/auth/';
				})

				socket.on('success-logout', (message) => {
					window.location.href = '/auth/';
				})

				setLogout(socket);
			},
		},
		computed: {
			roomIsSelected: function () {
				return this.selectedRoom ? true : false;
			},
			userIsRoomHost: function () {
				return this.currentRoomRole == 'host';
			},
			userIsRoomPlayer: function () {
				return this.currentRoomRole == 'player' || this.userIsRoomHost;
			},
			userIsRoomSpectator: function () {
				return this.currentRoomRole == 'spectator';
			}
		},
		components: {
			'game-room': {
				props: ['room'],
				data: function () {
					return {
						name: this.room.name,
						settings: this.room.settings,
						users: this.room.users,
						id: this.room.id
					}
				},
				methods: {
					selectRoom: function (event) {
						if (event) {
							this.$parent.selectedRoom = this.room;
						} else {
							this.$parent.selectedRoom = null;
						}
					},
					start: function (event) {
					socket.emit('start-game', this.id);
					},
				}
			}
		}
	})
	globalObject.init();
})();