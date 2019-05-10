class GameState {
	constructor(){
		// Zones status.
		this.player1 = {
			lrigTrashZone: [],
			trashZone: [],
			mainDeckZone: [],
			lrigDeckZone: [],
			lrigZone: {
				lrig: {},
				key: {},
				under: [],
			},
			lifeClothZone: [],
			checkZone: [],
			enerZone: [],
			signiZones: [
				{card: {}, under: {}},
				{card: {}, under: {}},
				{card: {}, under: {}},
			],
		},

		this.player2 = {
			lrigTrashZone: [],
			trashZone: [],
			mainDeckZone: [],
			lrigDeckZone: [],
			lrigZone: {
				lrig: {},
				key: {},
				under: [],
			},
			lifeClothZone: [],
			checkZone: [],
			enerZone: [],
			signiZones: [
				{card: {}, under: {}},
				{card: {}, under: {}},
				{card: {}, under: {}},
			],
		}

	}
}

module.exports = GameState;
