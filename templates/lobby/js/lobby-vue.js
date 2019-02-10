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
			gameRooms: [],

			// Modals
			showModal: false,
			createRoomModal: false,
			passwordModal: false,
			filterModal: false,
			friendListModal: false,
		},
		methods: {
			// Dom manipulation.
			toggleModal: function (modal) {
				if (modal) {
					this.showModal = true;
					console.log('modal');
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
					console.log('rik');
					this.createRoomModal = true;
				} else if (modal == 'filter') {
					this.filterModal = true;
				} else if (modal == 'friends') {
					this.friendListModal = true;
				}
			},
			// Socket emits.
			createRoom: function () {
				socket.emit('create-room', room);
			},
			closeRoom: function () {
				socket.emit('close-room', 'close pls');
			},
			leaveRoom: function () {
				socket.emit('leave-room', 'leave pls');
			},
			init: function () {
				socket.emit('check-user-location', 'check');

				socket.on('restore-room', (room) => {
					
				});
				socket.on('refresh-lobby', (data) => {

				});
				socket.on('joining-room', (room) => {

				});
				socket.on('closed-room', (room) => {

				});
				socket.on('refresh-room', (room) => {
					console.log(room.users);
				});
				socket.on('left-room', (id) => {
					
				});
				socket.on('failed-room-creation', (message) => {
					
				});
				socket.on('error-message', (message) => {
					console.log(message);
					console.log(socket);
				});
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

		},
		components: {
			'game-room': {
				props: ['room'],
				data: function () {
					return {
						name: room.name,
						settings: room.settings,
						users: room.users,
						id: room.id
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