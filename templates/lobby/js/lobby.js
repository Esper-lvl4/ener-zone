$(function () {
		var socket = io('/lobby', {
			query: {
				token: localStorage.getItem('EnerZoneToken'),
				nickname: localStorage.getItem('EnerZoneNickname') ? localStorage.getItem('EnerZoneNickname') : null,
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
			}
			delete (event) {
				socket.emit('delete-room', this.id);
			}
			join (event, role) {
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
			gameRooms.forEach(function (room) {
				$(lobby.gameList).append($(room.elem).text(room.name));
			});
			if (selectedRoom !== null) {
				$(selectedRoom.elem).addClass('js-selected-room');
			}
		}

		/*****/

		socket.on('set-nickname', function (nickname) {
			localStorage.setItem('EnerZoneNickname', nickname);
		})

		socket.on('refresh-lobby', function (data) {
			if (!data) {
				console.log('No game data were sent by server!');
				return;
			}
			//gameRooms = []
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
			$('#modal').removeClass('js-none');
			$('#create-room-form').removeClass('js-none');
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
		})

		// Joining a room.

		socket.on('joining-room', function (room) {
			// join namespace room.
			closeModal(null, true);
		})

		/* Close modal */

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
			console.log(message);
			$('#info-block').removeClass('js-none').text(message);
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

		
	})