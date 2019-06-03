const GameState = require('./../game/Game_State');
const BoardState = require('./../game/Board_State');

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
	let prototype = {
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
		socketRoom: 'room-' + this.id,
		state: false,
		chat: [],

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
			if (user.role == 'player') {
				this.players.push(user);
			} else {
				this.spectators.push(user);
			}
			socket.join(this.socketRoom);
		},
		leave(user, role) {
			let list = role + 's';
			if (typeof user == 'number') {
				this[list].splice(user, 1);
			} else if (typeof user == 'object') {

				for (let i = 0; i < this[list].length; i++) {
					if (this[list][i].token == user.token) {
						this[list].splice(i, 1);
					}
				}
			}
		},
		isFull() {
			let number = 2;
			if (this.settings.numberOfPlayers) number = this.settings.NumberOfPlayers;
			if (players.length < number) return true;
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
		start() {
			let game = GameState();
			let board = BoardState();
			Object.assign(this, game, board);
			this.state = true;
		},
	}

	let obj = Object.create(prototype);
	return obj;
}

module.exports = Room;
