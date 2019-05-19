const Rooms = require('../rooms/Game_Rooms');
const Game_State = require('./Game_State');

function Game (socket, io) {
	// Function for refreshing game.
	let room = Rooms.getByToken(socket.handshake.query.token).room;

	function refresh(token) {
		socket.to(room.socketRoom).emit('refreshGame', room);
		socket.emit(refreshGame, room);
	}

	socket.on('gameStarted', function (data) {
		console.log('game-started');
	});

	// Field manipulation events.
	socket.on('drawCard', async function (number) {
		let board = room.state.getBoard(socket);
		await board.draw(number);

		refresh();
	});

	socket.on('discardCard', async function (index) {
		let board = room.state.getBoard(socket);
		await board.discard(number);

		refresh();
	});

	socket.on('enerCharge', async function (number) {
		let board = room.state.getBoard(socket);
		await board.enerCharge(number);

		refresh();
	});

	socket.on('handCharge', async function (index) {
		let board = room.state.getBoard(socket);
		await board.charge(index);

		refresh();
	});
}

module.exports = Game;
