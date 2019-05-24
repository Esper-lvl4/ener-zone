const Rooms = require('../rooms/Game_Rooms');
const Game_State = require('./Game_State');

function Game (socket, io) {
	// Function for refreshing game.
	let room = Rooms.getByToken(socket.handshake.query.token).room;
	let board = room.state.getBoard(socket);

	function refresh(token) {
		socket.to(room.socketRoom).emit('refreshGame', room);
		socket.emit(refreshGame, room);
	}

	// socket handlers

	function gameStarted (data) {
		console.log('game-started');
	}

	async function drawCard (number) {
		await board.draw(number);
		refresh();
	}

	async function discardCard (index) {
		await board.discard(number);
		refresh();
	}

	async function enerCharge (number) {
		await board.enerCharge(number);
		refresh();
	}

	async function chargeHand (index) {
		await board.chargeHand(index);
		refresh();
	}

	async function callSigni (handIndex, zoneIndex) {
		await board.callSigni(handIndex, zoneIndex);
		refresh();
	}

	socket.on('gameStarted', gameStarted);

	// Field manipulation events.
	socket.on('drawCard', drawCard);
	socket.on('discardCard', discardCard);
	socket.on('enerCharge', enerCharge);
	socket.on('handCharge', chargeHand);
	socket.on('callSigni', callSigni);
}

module.exports = Game;
