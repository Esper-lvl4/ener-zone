const Users = require('../users/Users');

function MainMenu (socket) {
	console.log('User entered main menu');
	
	socket.on('mighty-click', function(values) {
		console.log('its working');
	});

	socket.on('logout', function (user) {
		Users.updateState(socket, 'remove', socket.handshake.query.token);
		socket.emit('success-logout', {auth: false, token: null});
	});
}

module.exports = MainMenu;