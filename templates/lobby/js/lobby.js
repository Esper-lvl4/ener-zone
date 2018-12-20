$(function () {
		var socket = io('/lobby', {
			query: {
				token: localStorage.getItem('EnerZoneToken'),
				nickname: localStorage.getItem('EnerZoneNickname') ? localStorage.getItem('EnerZoneNickname') : null,
			},
		});

		console.log(socket);

		socket.on('set-nickname', function (nickname) {
			localStorage.setItem('EnerZoneNickname', nickname);
		})

		socket.on('refresh-lobby', function (data) {
			console.log(data);
		})

		socket.emit('create-room', 'Checking');

		socket.on('failed-auth', function (message) {
			window.location.href = '/auth/';
		})

		socket.on('success-logout', function (message) {
			window.location.href = '/auth/';
		})

		setLogout(socket);

		
	})