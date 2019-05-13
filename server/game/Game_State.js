import Player from './Game_Player';

class GameState {
	constructor(user) {
		this.players = [];

		this.phase = 'Draw phase';
		this.turnPlayer = 1;
		this.chatHistory = [];

	}
}

module.exports = GameState;
