const express = require('express');

function LobbyRoom (socket) {
	console.log(`User entered lobby:`);
	console.log(socket.handshake);
	socket.on('', function (data) {

	});
};

module.exports = LobbyRoom;