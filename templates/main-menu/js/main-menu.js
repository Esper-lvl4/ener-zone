$(function () {
		var socket = io('/main-menu', {
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