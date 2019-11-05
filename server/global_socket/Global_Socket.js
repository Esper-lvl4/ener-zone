const stampit = require('stampit');

let GlobalSocket = stampit({
	props: {
		instance: null,
	},
	methods: {
		provideServerInstance(io) {
			this.instance = io;
		},
		broadcastToRoom({room, eventName, data}) {
			this.instance.to(room).emit(eventName, data);
		},
		broadcastToAll({eventName, data}) {
			this.instance.sockets.emit(eventName, data);
		}
	}
})

module.exports = GlobalSocket();
