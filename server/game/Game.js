const Rooms = require('../rooms/Game_Rooms');

function Game (socket, io) {
	// Function for refreshing game.
	function refresh(token) {
		let room = Rooms.getByToken(token).room;
		socket.to(room.socketRoom).emit('refreshGame', room);
		socket.emit(refreshGame, room);
	}
	socket.on('gameStarted', function (data) {
		console.log('game-started');
	});

	// Field manipulation events.
	socket.on('drawCard', function (number) {
		
	})
}

module.exports = Game;
