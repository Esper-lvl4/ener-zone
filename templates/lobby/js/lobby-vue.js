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
			},
			returnToLobby: function () {
				this.toggleModal();
				this.roomActive = false;
				this.currentRoom = null;
			},

			// Socket emits.

			createRoom: function () {
				socket.emit('create-room', this.roomCreationObj);
			},
			closeRoom: function () {
				socket.emit('close-room', 'close pls');
			},
			leaveRoom: function () {
				socket.emit('leave-room', 'leave pls');
			},

			// socket events handlers.

			restoreRoom: function (room) {
				this.initRoom(room);
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
			joiningRoom: function (room) {
				console.log(room);
				this.initRoom(room);
			},
			closedRoom: function (room) {
				this.returnToLobby(room);
			},
			refreshRoom: function (room) {
				console.log(room.users);
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
					join: function (role) {
						socket.emit('join-room', {id: this.id, role: role});
					},
					start: function (event) {
					socket.emit('start-game', this.id);
					},

				}
			}
		}
	})
	globalObject.init();
})()

// Class for rooms.
			class GameRoom {
				constructor (room) {
					this.name = room.name;
					this.settings = room.settings;
					this.users = room.users;
					this.elem = $('<li>');
					this.id = room.id;
				}

				select (event) {
					selectedRoom = this;
					$(lobby.gameList).find('li').removeClass('js-selected-room');
					$(event.target).addClass('js-selected-room');
					$('#join-room-button').prop('disabled', false);
				}
				delete () {
					this.elem.remove();
				}
				join (role) {
					socket.emit('join-room', {id: this.id, role: role});
				}
				start (event) {
					socket.emit('start-game', this.id);
				}
				initEvents() {
					$(this.elem).on('click', this.select.bind(this));
				}
			}