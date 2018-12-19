$(function () {
		var socket = io('/lobby', {
			query: {
				token: localStorage.getItem('EnerZoneToken'),
			},
		});

		socket.on('failed-auth', function (socket) {
			window.location.href = '/auth/';
		})

		socket.on('success-logout', function (socket) {
			window.location.href = '/auth/';
		})

		setLogout(socket);

		
	})