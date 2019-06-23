const GameState = require('./../game/Game_State');
const BoardState = require('./../game/Board_State');
const State = require('./../state/State');

// function for cloning objects.
function cloneObject(obj) {
	var clone = {};
	for (var i in obj) {
		if (obj[i] != null && typeof(obj[i]) == 'object' && obj[i].forEach) {
			clone[i] = cloneArray(obj[i]);
		} else if (obj[i] != null && typeof(obj[i]) == 'object') {
			clone[i] = cloneObject(obj[i]);
		} else {
			clone[i] = obj[i];
		}
	}
	return clone;
}

// function for cloning arrays.
function cloneArray(arr) {
	var clone = [];
	for (var a in arr) {
		if (arr[a] != null && typeof(arr[a]) == 'object' && arr[a].forEach) {
			clone.push(cloneArray(arr[a]));
		} else if (arr[a] != null && typeof(arr[a]) == 'object') {
			clone.push(cloneObject(arr[a]));
		} else {
			clone.push(arr[a]);
		}
	}
	return clone;
}

function Room (socket, roomObj, id) {
	let props = {
		players: [],
		spectators: [],
		name: roomObj.name,
		settings: roomObj.settings,
		/*
		{
			format: 'as',
			timeLimit: '180',
			password: '',
		}
		*/
		id: id + '',
		socketRoom: 'room-' + id,
		state: false,
		initiated: false,
		chat: [],
	};

	let prototype = {
		refresh(socket) {
			let roomClone = this.clear();
			socket.to(this.socketRoom).emit('refreshRoom', roomClone);
			socket.emit('refreshRoom', roomClone);
		},
		clear() {
			// Clone room, then remove tokens, to not send them, and dont affect initial room object.
			let roomClone = cloneObject(this);
			roomClone.players.forEach((player) => {
				delete player.token;
			})
			roomClone.spectators.forEach((spectator) => {
				delete spectator.token;
			})
			return roomClone;
		},

		join(socket, user) {
			// check if there is space for more players.
			if (this.isFull() && info.role !== 'spectator') {
				socket.emit('errorMessage', 'The room is full. You can spectate this game, if you want, though.');
				return false;
			} else if (user.role == 'player' || user.role == 'host') {
				this.players.push(user);
			} else {
				this.spectators.push(user);
			}
			socket.join(this.socketRoom);
			return true;
		},

		leave(socket) {
			let user = null;
			for (let i = 0; i < this.players.length; i++) {
				if (this.players[i].token === socket.handshake.query.token) {
					user = this.players[i];
					this.players.splice(i, 1);
					return user;
				}
			}
			for (let i = 0; i < this.spectators.length; i++) {
				if (this.spectators[i].token === socket.handshake.query.token) {
					user = this.spectators[i];
					this.spectators.splice(i, 1);
					return user;
				}
			}
		},
		isFull() {
			let number = 2;
			if (this.settings.numberOfPlayers) number = this.settings.NumberOfPlayers;
			if (this.players.length == number) return true;
			return false;
		},
		isEmpty() {
			// Check if there are still players in the room. Dont count spectators, but search for host in their list.
			if (this.players.length == 0) {
				for (let i = 0; i < this.spectators.length; i++) {
					if (this.spectators[i].isHost) {
						return false;
						break;
					}
				}
			}
			return true;
		},
		getPlayer(socket) {
			let token = socket.handshake.query.token;
			for (let player of this.players) {
				if (player.token === token) {
					return player;
				}
			}
		},
		setPlayerReady(socket, value) {
			for (let player of this.players) {
				if (socket.handshake.query.token == player.token) {
					player.ready = value;
				}
			}
		},
		start() {
			this.init();
			this.state = true;
		},
	}

	let game = GameState();
	let board = BoardState();
	Object.assign(prototype, game.__proto__, board.__proto__);
	let obj = Object.create(prototype);
	Object.assign(obj, game, board, props);
	return obj;
}

module.exports = Room;
