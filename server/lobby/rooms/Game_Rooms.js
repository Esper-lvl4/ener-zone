const State = require('./../../state/State');
const Room = require('./Room');
const stampit = require('stampit');
const EventEmittable = require('@stamp/eventemittable');
const {showError} = require('./../../tools/tools');

const GameRooms = stampit({
	init () {
		this.list = [];
		this.counter = 0;

		this.on('host-room', this.add);
		this.on('close-toom', this.remove);
		this.on('refresh-for-one', this.refresh);
	},
	methods: {
		add(roomObj, socket) {
			for (var i = 0; i < this.list.length; i++) {
				if (this.list[i].name == roomObj.name) {
					socket.emit('errorMessage', 'Room with that name already exists. Try changing name.');
				}
			};
			let user = State.getUser(socket);
			let room = Room(socket, roomObj, ++this.counter);

			this.list.push(room);
			room.emit('join', {socket, user});
		},
		remove(id) {
			let room = this.getById(id);
			if (room) {
				room.emit('closing');
				this.list.splice(room.index, 1);
				this.removeOneRoomAll(id);
			}
		},

		// Joining room.
		joinRoom(socket, info) {
			if (!info || !info.role || !info.id) {
				socket.emit('errorMessage', "Info weren't provided or weren't complete");
			}

			let room = this.getById(info.id);
			let user = State.getUser(socket);

			if (!room) {
				socket.emit('errorMessage', 'Could not find room to join.');
				return;
			} else if (!user) {
				socket.emit('errorMessage', 'User, that tries to joing the game, does not exists');
				return;
			}
			user.role = info.role;
			room.emit("join", {socket, user});
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
		getRoom (socketOrId) {
			if (typeof socketOrId == "object") {
				return this.getByToken(socketOrId);
			} else if (typeof socketOrId == "string") {
				return this.getById(socketOrId);
			}
		},

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
						return {room: this.list[i], index: i};
					}
				}
				for (let k = 0; k < this.list[k].spectators.length; k++) {
					if (token === this.list[i].spectators[k].token) {
						return {room: this.list[i], index: i};
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
		},

		// Refresh one room for all.
		refreshOneRoomAll (io, room) {
			let roomClone = room.clear();
			io.sockets.emit('roomChanged', roomClone);
		},
		// Add one room for all.
		addOneRoomAll (io, room) {
			let roomClone = room.clear();
			io.sockets.emit('roomAdded', roomClone);
		},
		// Remove one room for all.
		removeOneRoomAll (io, room) {
			io.sockets.emit('roomRemoved', room.id);
		},
	},
}).compose(EventEmittable);

module.exports = GameRooms();
