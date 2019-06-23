const State = require('../state/State');
const Room = require('./Room');


var gameRooms = {
	list: [],
	counter: 0,

	canCreate(name) {
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i].name == name) {
				return = false;
			}
		};
		return true;
	},

	async add(socket, roomObj) {
		let room = Room(socket, roomObj, ++this.counter);
		this.list.push(room);

		let user = await State.getUser(socket);
		user.role = 'host';
		room.join(socket, user);

		return room;
	},
	remove(index) {
		this.list.splice(index, 1);
	},

	// functions for removing tokens from rooms before sending them. For all rooms and for one room.
	clear() {
		let roomClones = [];
		// Clone rooms, then remove tokens, to not send them, and dont affect initial room objects.
		for (let room of this.list) {
			roomClones.push(room.clear());
		}
		return roomClones;
	},

	// Check if room is empty, to remove it from the list.
	checkEmptiness(room) {
		if (room.isEmpty()) {
			for (let i = 0; i < this.list.length; i++) {
				if (room.id === this.list[i].id) {
					this.list.splice(i, 1);
					break;
				}
			}
		}
	},

	// functions to search for rooms. By ID and by user jwt.
	getById (id) {
		if (!id) {return false;}

		for (let i = 0; i < this.list.length; i++) {
			if (id === this.list[i].id) {
				return {room: this.list[i], index: i};
			}
		}
		return false;
	},
	getByToken (token) {
		if (!token) {return false;}

		for (let i = 0; i < this.list.length; i++) {
			for (let j = 0; j < this.list[i].players.length; j++) {
				if (token === this.list[i].players[j].token) {
					return {room: this.list[i], index: i, userIndex: j, role: 'player'};
				}
			}
			for (let k = 0; k < this.list[k].spectators.length; k++) {
				if (token === this.list[i].spectators[k].token) {
					return {room: this.list[i], index: i, userIndex: k, role: 'spectator'};
				}
			}
		}
		return false;
	},

	// Refresh lobby for one socket.
	refresh (socket) {
		if (this.list.length === 0) {
			socket.emit('refreshLobby', []);
		}
		let roomClones = this.clear(this.list);
		socket.emit('refreshLobby', roomClones);
	},

	// Refresh lobby for all.
	refreshAll (io) {
		if (this.list.length === 0) {
			io.sockets.emit('refreshLobby', []);
		}
		let roomClones = this.clear(this.list);
		io.sockets.emit('refreshLobby', roomClones);
	}
}

module.exports = gameRooms;
