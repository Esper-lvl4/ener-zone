$(function () {
		var socket = io('/lobby', {
			query: {
				token: localStorage.getItem('EnerZoneToken'),
			},
		});

		// Lobby config.
		var lobby = {
			gameList: $('#game-list'),
		}

		var gameRooms = [];
		var chatHistory = [];
		var selectedRoom = null;

		console.log(socket);

		// Room class. Forced to do it like that to prevent users from changing room's id in console.
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
			delete (event) {
				socket.emit('delete-room', this.id);
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
		/*****/

		/* Function for rendering lobby */

		function renderLobby () {
			// render gamelist.
			$(lobby.gameList).find('li').removeClass('js-selected-room');
			$('#join-room-button').prop('disabled', true);
			gameRooms.forEach(function (room) {
				$(lobby.gameList).append($(room.elem).text(room.name));
			});
			if (selectedRoom !== null) {
				$(selectedRoom.elem).addClass('js-selected-room');
				$('#join-room-button').prop('disabled', false);
			}
			// render chat.
			// ...
		}

		/*****/

		socket.on('refresh-lobby', function (data) {
			if (!data) {
				console.log('No game data were sent by server!');
				return;
			}
			for (var i = 0; i < data.rooms.length; i++) {
				let skip = false;
				for (var j = 0; j < gameRooms.length; j++) {
					if (data.rooms[i].id === gameRooms[j].id) {
						skip = true;
						break;
					}		
				}
				if (skip) {
					continue;
				}
				gameRooms.push(new GameRoom(data.rooms[i]));
				gameRooms[gameRooms.length - 1].initEvents();
			}

			console.log(data);

			chatHistory =	data.history;
			renderLobby();
		})

		// Create new room.

		$('#create-room-button').on('click', function (event) {
			event.preventDefault();
			openModal('#create-room-form');
		});

		$('#create-room-form').on('submit', function (event) {
			event.preventDefault();
			var room = {
				name: $('#room-name').val(),
				settings: {
					format: $('#room-format').val(),
					timeLimit: $('#room-time-limit').val(),
					password: $('#room-password').val(),
				}
			};
			socket.emit('create-room', room);
			closeModal(null, true);
		})

		// Joining a room.

		// Check if user selected room, and if there is a password in selected room. 
		// Allow joining if there is no password - initiate event on server.
		$('#join-room-button').on('click', function (event) {
			event.preventDefault();
			if (!selectedRoom) {
				return;
			}
			if (selectedRoom.settings.password === '') {
				selectedRoom.join('player');
			} else {
				openModal('#game-password-modal');
			}
		})

		$('#game-password-modal').on('submit', function (event) {
			event.preventDefault();
			if(selectedRoom.settings.password === $('#join-password').val()) {
				selectedRoom.join('player');
			} else {
				$('#info-block').removeClass('js-none').text('Wrong password. You may try again ^^');
			}
		})

		function initRoom () {
			$('#room-wrap').removeClass('js-none');
			$('.lobby-filter-wrap').addClass('js-none');
			$('#game-list').addClass('js-none');
		}

		socket.on('joining-room', function (room) {
			// join namespace room.
			closeModal(null, true);
			initRoom();
			console.log(room);
		})

		socket.on('refresh-room', function (room) {
			console.log(room.users);
		})

		/* Open modals */

		function openModal (modal) {
			$('#modal').removeClass('js-none');
			$(modal).removeClass('js-none');
		}

		/* Close modals */

		function closeModal (event, all) {
			if (all) {
				$('#modal').addClass('js-none');
				$('#modal > *').addClass('js-none');
			}
			else if($(event.target).hasClass('modal-close')) {
				$(event.target).parents('form').addClass('js-none');
				$(event.target).parents('.modal-window').addClass('js-none');
			} 
			else if ($(event.target).hasClass('modal-window')) {
				$(event.target).addClass('js-none');
				$(event.target).find('form').addClass('js-none');
			} 
		}
		$('.modal-close').on('click', closeModal);
		$('#modal').on('click', closeModal);

		// Show info.

		socket.on('failed-room-creation', function (message) {
			$('#info-block').removeClass('js-none').text(message);
		})

		socket.on('error-message', function (message) {
			console.log(message);
			console.log(socket);
		})

		// Clear info.
		function clearInfo () {
			$('#info-block').empty().addClass('js-none');
		}

		$('#modal input').on('input change', clearInfo);

		socket.on('failed-auth', function (message) {
			window.location.href = '/auth/';
		})

		socket.on('success-logout', function (message) {
			window.location.href = '/auth/';
		})

		setLogout(socket);
		
});