$(function () {
		var socket = io('/lobby', {
			query: {
				token: localStorage.getItem('EnerZoneToken'),
				nickname: localStorage.getItem('EnerZoneNickname') ? localStorage.getItem('EnerZoneNickname') : null,
			},
		});

		// Room class. Forced to do it like that to prevent users from changing room's id in console.
		class GameRoom {
			constructor (room) {
				this.name = room.name;
				this.settings = room.settings;
				this.users = room.users;
				this.elem = $('<li>');
				this.id = room.id;
			}

			insertRoom () {
				$('#game-list').append($(this.elem).text(this.name));
			}
			deleteRoom (event) {
				$(this.elem).remove();
				socket.emit('delete-room', this);
			}
			joinRoom (event) {
				socket.emit('join-room', this.id);
			}
		}

		console.log(socket);

		var gameRooms = [];
		var chatHistory = [];

		socket.on('set-nickname', function (nickname) {
			localStorage.setItem('EnerZoneNickname', nickname);
		})

		socket.on('refresh-lobby', function (data) {
			if (!data) {
				console.log('No game data were sent by server!');
				return;
			}
			gameRooms = data.gameRooms;
			chatHistory = data.chatHistory;
			console.log(data);
		})

		//socket.emit('create-room', {name: 'wixoss-test', settings: {format: 'as', timeLimit: '600', password: '35234'}});

		socket.on('failed-auth', function (message) {
			window.location.href = '/auth/';
		})

		socket.on('success-logout', function (message) {
			window.location.href = '/auth/';
		})

		setLogout(socket);

		
	})