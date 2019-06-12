<template>
	<!-- Game block -->
	<div class="game-wrap wrap-size">
		<CardInfo :card-info="hoveredCard"/>
		<div class="top-player-field">
			<div class="lrig-trash-zone block-style">
				<div class="zone-content">
					<img src="https://vignette.wikia.nocookie.net/selector-wixoss/images/d/d0/WDK07-Y06.jpg/revision/latest?cb=20180921002552" alt="noname">
				</div>
			</div>
			<div class="lrig-deck-zone block-style">
				<div class="zone-content">
					<img class="card" src="https://vignette.wikia.nocookie.net/selector-wixoss/images/d/d0/WDK07-Y06.jpg/revision/latest?cb=20180921002552" alt="iona">
				</div>
			</div>
			<div class="life-cloth-zone block-style">
				<div class="zone-content">
					lifecloth
				</div>
			</div>
			<div class="trash-zone block-style">
				<div class="zone-content">
					trash
				</div>
			</div>
			<div class="lrig-zone block-style">
				<div class="zone-content">
					lrig/key
				</div>
			</div>
			<div class="check-zone block-style">
				<div class="zone-content">
					check zone
				</div>
			</div>
			<div class="main-deck-zone block-style">
				<div class="zone-content">
					main deck
				</div>
			</div>
			<div class="signi-zones block-style">
				<div class="zone-content">
					<div class="signi-zone1">Right signi zone</div>
					<div class="signi-zone2">Middle signi zone</div>
					<div class="signi-zone3">Left signi zone</div>
				</div>
			</div>
			<div class="ener-zone block-style">
				<div class="zone-content">
					Ener-zone
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
	data() {
		return {
			// Game props
			hoveredCard: null,
			check: '',
		}
	},
	computed: {
		userBoard() {
			let board = this.$store.state.currentRoom.board;
			this.check = this.$store.state.currentRoom.board;
			for (let i = 0; i < board.length; i++) {
				if (board[i].player == localStorage.getItem('Nickname')) {
					return i;
				}
			}
			return false;
		},
		enemyBoard() {
			let board = this.$store.state.currentRoom.board;
			this.check = board;
			for (let i = 0; i < board.length; i++) {
				if (board[i].player != localStorage.getItem('Nickname')) {
					return i;
				}
			}
		}
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
