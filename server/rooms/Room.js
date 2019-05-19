const GameState = require('../game/Game_State');

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

class Room {
	constructor(socket, roomObj, id) {
		this.users = [];
		this.name = roomObj.name;
		this.settings = roomObj.settings;
		/*
		{
			format: 'as',
			timeLimit: '180',
			password: '',
		}
		*/
		this.id = id + '';
		this.socketRoom = 'room-' + this.id;
		this.state = false;
		this.chat = [];
	}
	clear() {
		// Clone room, then remove tokens, to not send them, and dont affect initial room object.
		let roomClone = cloneObject(this);
		roomClone.users.forEach((user) => {
			delete user.token;
		})
		return roomClone;
	}
	join(socket, user) {
		this.users.push(user);
		socket.join(this.socketRoom);
	}
	leave(user) {
		console.log(typeof user);
		if (typeof user == 'number') {
			console.log('number');
			this.users.splice(user, 1);
		} else if (typeof user == 'object') {
			console.log('object');
			for (let i = 0; i < this.users.length; i++) {
				if (this.users[i].token == user.token) {
					this.users.splice(i, 1);
				}
			}
		}
	}
	isFull() {
		let playerCount = 0;
		for (let j = 0; j < this.users.length; j++) {
			if (this.users[j].role == 'player' || this.users[j].role == 'host') {
				playerCount++;
			}
			if (playerCount === 2) {
				return true;
				break;
			}
		}
		return false;
	}
	isEmpty() {
		// Check if there are still players in the room. Dont count spectators.
		for (let k = 0; k < this.users.length; k++) {
			if (this.users[k].role == 'player' || this.users[k].role == 'host') {
				return false;
				break;
			}
		}
		return true;
	}
	start() {
		this.state = new GameState(this.users);
	}
}

module.exports = Room;
