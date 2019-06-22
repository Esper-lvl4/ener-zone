<template>
	<!-- Game block -->
	<div class="game-wrap wrap-size">
		<CardInfo :card-info="hoveredCard"/>
		<div class="top-player-field">
			<div class="lrig-trash-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in enemyBoard.lrigTrash"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="lrig-deck-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in enemyBoard.lrigDeck"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="life-cloth-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in enemyBoard.lifeCloth"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="trash-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in enemyBoard.trash"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="lrig-zone block-style">
				<div class="zone-content">
					<img v-if="enemyBoard.lrigZone.card !== null"
		        :width="enemyBoard.lrigZone.card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="enemyBoard.lrigZone.card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="enemyBoard.lrigZone.card.image"
		        :alt="enemyBoard.lrigZone.card.name"
		        data-number="lrig">
					<img v-for="(card, index) in enemyBoard.lrigZone.key"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
					<div class="under">
						<img v-for="(card, index) in enemyBoard.lrigZone.under"
							:width="card.type.toLowerCase() == 'key' ? 550 : 392"
							:height="card.type.toLowerCase() == 'key' ? 392 : 550"
							:src="card.image"
							:alt="card.name"
							:data-number="index">
					</div>
				</div>
			</div>
			<div class="check-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in enemyBoard.checkZone"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="main-deck-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in enemyBoard.mainZone"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="signi-zones block-style">
				<div class="zone-content">
					<div class="signi-zone1">
						<img v-if="enemyBoard.signiZones[0].card !== null"
			        :width="enemyBoard.signiZones[0].card.type.toLowerCase() == 'key' ? 550 : 392"
			        :height="enemyBoard.signiZones[0].card.type.toLowerCase() == 'key' ? 392 : 550"
			        :src="enemyBoard.signiZones[0].card.image"
			        :alt="enemyBoard.signiZones[0].card.name"
			        data-number="lrig">
						<div class="under">
							<img v-for="(card, index) in enemyBoard.signiZones[0].under"
				        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
				        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
				        :src="card.image"
				        :alt="card.name"
				        :data-number="index">
						</div>
					</div>
					<div class="signi-zone2">
						<img v-if="enemyBoard.signiZones[1].card !== null"
			        :width="enemyBoard.signiZones[1].card.type.toLowerCase() == 'key' ? 550 : 392"
			        :height="enemyBoard.signiZones[1].card.type.toLowerCase() == 'key' ? 392 : 550"
			        :src="enemyBoard.signiZones[1].card.image"
			        :alt="enemyBoard.signiZones[1].card.name"
			        data-number="lrig">
						<div class="under">
							<img v-for="(card, index) in enemyBoard.signiZones[1].under"
				        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
				        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
				        :src="card.image"
				        :alt="card.name"
				        :data-number="index">
						</div>
					</div>
					<div class="signi-zone3">
						<img v-if="enemyBoard.signiZones[2].card !== null"
			        :width="enemyBoard.signiZones[2].card.type.toLowerCase() == 'key' ? 550 : 392"
			        :height="enemyBoard.signiZones[2].card.type.toLowerCase() == 'key' ? 392 : 550"
			        :src="enemyBoard.signiZones[2].card.image"
			        :alt="enemyBoard.signiZones[2].card.name"
			        data-number="lrig">
						<div class="under">
							<img v-for="(card, index) in enemyBoard.signiZones[2].under"
				        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
				        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
				        :src="card.image"
				        :alt="card.name"
				        :data-number="index">
						</div>
					</div>
				</div>
			</div>
			<div class="ener-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in enemyBoard.enerZone"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
		</div>
		<div class="bottom-player-board">
			<div class="lrig-trash-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in userBoard.lrigTrash"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="lrig-deck-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in userBoard.lrigDeck"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="life-cloth-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in userBoard.lifeCloth"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="trash-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in userBoard.trash"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="lrig-zone block-style">
				<div class="zone-content">
					<img v-if="userBoard.lrigZone.card !== null"
		        :width="userBoard.lrigZone.card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="userBoard.lrigZone.card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="userBoard.lrigZone.card.image"
		        :alt="userBoard.lrigZone.card.name"
		        data-number="lrig">
					<img v-for="(card, index) in userBoard.lrigZone.key"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
					<div class="under">
						<img v-for="(card, index) in userBoard.lrigZone.under"
							:width="card.type.toLowerCase() == 'key' ? 550 : 392"
							:height="card.type.toLowerCase() == 'key' ? 392 : 550"
							:src="card.image"
							:alt="card.name"
							:data-number="index">
					</div>
				</div>
			</div>
			<div class="check-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in userBoard.checkZone"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="main-deck-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in userBoard.mainZone"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
			<div class="signi-zones block-style">
				<div class="zone-content">
					<div class="signi-zone1">
						<img v-if="userBoard.signiZones[0].card !== null"
			        :width="userBoard.signiZones[0].card.type.toLowerCase() == 'key' ? 550 : 392"
			        :height="userBoard.signiZones[0].card.type.toLowerCase() == 'key' ? 392 : 550"
			        :src="userBoard.signiZones[0].card.image"
			        :alt="userBoard.signiZones[0].card.name"
			        data-number="lrig">
						<div class="under">
							<img v-for="(card, index) in userBoard.signiZones[0].under"
				        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
				        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
				        :src="card.image"
				        :alt="card.name"
				        :data-number="index">
						</div>
					</div>
					<div class="signi-zone2">
						<img v-if="userBoard.signiZones[1].card !== null"
			        :width="userBoard.signiZones[1].card.type.toLowerCase() == 'key' ? 550 : 392"
			        :height="userBoard.signiZones[1].card.type.toLowerCase() == 'key' ? 392 : 550"
			        :src="userBoard.signiZones[1].card.image"
			        :alt="userBoard.signiZones[1].card.name"
			        data-number="lrig">
						<div class="under">
							<img v-for="(card, index) in userBoard.signiZones[1].under"
				        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
				        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
				        :src="card.image"
				        :alt="card.name"
				        :data-number="index">
						</div>
					</div>
					<div class="signi-zone3">
						<img v-if="userBoard.signiZones[2].card !== null"
			        :width="userBoard.signiZones[2].card.type.toLowerCase() == 'key' ? 550 : 392"
			        :height="userBoard.signiZones[2].card.type.toLowerCase() == 'key' ? 392 : 550"
			        :src="userBoard.signiZones[2].card.image"
			        :alt="userBoard.signiZones[2].card.name"
			        data-number="lrig">
						<div class="under">
							<img v-for="(card, index) in userBoard.signiZones[2].under"
				        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
				        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
				        :src="card.image"
				        :alt="card.name"
				        :data-number="index">
						</div>
					</div>
				</div>
			</div>
			<div class="ener-zone block-style">
				<div class="zone-content">
					<img v-for="(card, index) in userBoard.enerZone"
		        :width="card.type.toLowerCase() == 'key' ? 550 : 392"
		        :height="card.type.toLowerCase() == 'key' ? 392 : 550"
		        :src="card.image"
		        :alt="card.name"
		        :data-number="index">
				</div>
			</div>
		</div>
	</div>
	<!-- /Game block -->
</template>

<script>
import CardInfo from './../Deck_Editor/Card_Info.vue'

export default {
  name: 'game',
	components: {CardInfo},
	sockets: {
		refreshGame(room) {
			this.$store.commit('changeCurrentRoom', room)
		}
	},
	data() {
		return {
			// Game props
			hoveredCard: null,
			check: '',
		}
	},
	computed: {
		// Current room.
		room () {
			return this.$store.state.currentRoom;
		},
		// boards
		enemyBoard () {
			for (let board of this.room.board) {
				if (board.player !== localStorage.getItem('Nickname')) {
					return board;
				}
			}
		},
		userBoard () {
			for (let board of this.room.board) {
				if (board.player === localStorage.getItem('Nickname')) {
					return board;
				}
			}
		},
	},
	methods: {
		cardHover(event, deck) {
      if (event.target.tagName !== 'IMG') {
  			return;
  		}
  		let number = event.target.parentElement.getAttribute('data-number');
      this.cardHover(this[deck][number]);
    },
	},
	mounted() {
		this.$forceUpdate()
	}
}
</script>
