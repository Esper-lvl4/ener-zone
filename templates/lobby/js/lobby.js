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
			readyToStart: false,

			// Modals props
			showModal: false,
			createRoomModal: false,
			passwordModal: false,
			filterModal: false,
			friendListModal: false,

			// Chat props
			chatHistory: [],
			roomHistory: [],
			activeTab: 'chat',
			messageInput: '',
			messagesIsForbidden: false,

			// Game props
			gameActive: true,
			cardHover: {
				image: '/files/img/default-card.jpg',
				name: '',
				props: '',
				class: '',
				cost: '',
				timing: '',
				power: '',
				limitCon: '',
				text: 'Gl hf',
			},

			// Zones status.
			lrigTrashZone: [
				{
					altImages: null,
					boosterSet: "WX-15 Incited Selector",
					class: "Nature Spirit: Bacteria",
					coins: null,
					color: "Black",
					cost: null,
					craft: false,
					effect: " <span style=\"color:#FFF; background: #00A33A; padding:0px 3px; border:2px solid #EEE; border-radius:3px; font-weight:bold; display:inline;\">Action</span> <a href=\"/wiki/Down\" class=\"image image-thumbnail link-internal\" title=\"Down\"><img src=\"https://vignette.wikia.nocookie.net/selector-wixoss/images/f/f9/Down.png/revision/latest?cb=20140814193330\" alt=\"Down\" class=\"\" data-image-key=\"Down.png\" data-image-name=\"Down.png\" width=\"18\" height=\"18\"></a>: Remove 1 [<a href=\"/wiki/Virus\" title=\"Virus\">Virus</a>] on your opponent&apos;s <a href=\"/wiki/Field\" title=\"Field\">field</a>. If you do, <a href=\"/wiki/Draw\" title=\"Draw\" class=\"mw-redirect\">draw</a> 1 card.\n",
					image: "https://vignette.wikia.nocookie.net/selector-wixoss/images/4/47/WX15-117.jpg/revision/latest?cb=20161008002426",
					ksLegal: false,
					level: "1",
					limit: null,
					limitingCondition: "Nanashi",
					link: "http://wixoss.wikia.com/wiki/Acnes,_Natural_Bacteria",
					lrigType: null,
					name: "Acnes, Natural Bacteria",
					number: 1,
					power: "1000",
					ru: false,
					timing: null,
					type: "SIGNI",
				}
			],
			trashZone: [],
			mainDeckZone: [],
			lrigDeckZone: [],
			lrigZone: {
				lrig: {},
				key: {},
				under: [],
			},
			lifeClothZone: [],
			checkZone: [],
			enerZone: [],
			signiZones: [
				{card: {}, under: {}},
				{card: {}, under: {}},
				{card: {}, under: {}},
			],
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
				this.roomHistory = [];
				this.activeTab = 'chat';
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

			// Chat methods.

			changeChatTab: function (tab) {
				if (!tab) {
					return;
				} else {
					this.activeTab = tab;
				}
			},
			allowMessages: function () {
				this.messagesIsForbidden = false;
			},

			// Socket emits(lobby).

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
			open: function () {
				console.log(this.readyToStart);
				if (this.readyToStart === true) {
					socket.emit('init-game', this.currentRoom.id);
				}
			},

			// Socket emits (chat).

			postMessage: function () {
				if (this.messageInput == '' || this.messagesIsForbidden) {
					return;
				}
				this.messagesIsForbidden = true;
				let date = new Date();
				date = date.getHours() + ':' + date.getMinutes();
				let message = {
					time: date,
					nickname: localStorage.getItem('Nickname'),
					text: this.messageInput,
				}
				if (this.activeTab === 'chat') {
					socket.emit('chat-message', message);
				} else if (this.activeTab === 'room') {
					socket.emit('room-message', message);
				}
				
				this.messageInput = '';
				setTimeout(this.allowMessages, 1000);
			},

			// socket events handlers.

			restoreRoom: function (room, role, rdy) {
				this.initRoom(room);
				this.currentRoomRole = role;
				this.roomHistory = room.chat;
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
				this.gameRooms = data;
				console.log(this.gameRooms);
			},
			refreshChat: function (data) {
				if (!data) {
					console.log('No chat data were sent by server!');
					return;
				}
				this.chatHistory =	data;
			},
			refreshRoomChat: function (data) {
				this.roomHistory = data;
				console.log(this.roomHistory);
			},
			joiningRoom: function (room, role) {
				console.log(room);
				this.currentRoomRole = role;
				this.initRoom(room);
			},
			closedRoom: function (room) {
				this.returnToLobby();
			},
			refreshRoom: function (room, rdy) {
				this.currentRoom = room;
				this.currentRoomPlayers = [];
				this.currentRoomSpectators = [];
				if (rdy !== undefined) {
					this.readiness = rdy;
				}
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
			readyToOpen: function () { // Ready to start the game.
				this.readyToStart = true;
			},

			// Socket Error handlers. 

			failedRoomCreation: function (message) {
				console.log(message);
			},
			errorMessage: function (message) {
				console.log(message);
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
		mounted: function () {
				socket.emit('check-user-location', 'check');
				
				socket.on('save-nick', (nick) => {
					if (!localStorage.getItem('Nickname')) {
						localStorage.setItem('Nickname', nick);
					}
				});
				socket.on('restore-room', this.restoreRoom);
				socket.on('refresh-lobby', this.refreshLobby);
				socket.on('joining-room', this.joiningRoom);
				socket.on('closed-room', this.closedRoom);
				socket.on('refresh-room', this.refreshRoom);
				socket.on('left-room', this.leftRoom);
				socket.on('ready-to-open', this.readyToOpen);

				socket.on('refresh-chat', this.refreshChat);
				socket.on('refresh-room-chat', this.refreshRoomChat);

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
	//globalObject.init();
})();