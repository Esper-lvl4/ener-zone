<template>
	<!-- Game block -->
	<div class="game-wrap wrap-size" v-on:card-hover="cardHover">
		<nav class="game-nav">
			<button class="main-button surrender" @click="surrenderPopup = true;">
				Surrender
			</button>
			<button class="main-button leave-game" @click="leaveGamePopup = true;">
				Leave game
			</button>
		</nav>
		<CardInfo :card-info="hoveredCard"/>
		<div class="top-player-field">
			<CardZone
			zone-name="lrig-trash-zone" :zone="enemyField.lrigTrash"
			cardback="lrig"/>
			<CardZone 
				class="lrig-deck-zone" :zone="enemyField.lrigDeck" 
				is-hidden cardback="lrig"/>
			<CardZone zone-name="life-cloth-zone" :zone="enemyField.lifeCloth" is-hidden/>
			<CardZone zone-name="trash-zone" :zone="enemyField.trash"/>
			<LrigZone zone-names="lrig-zone" :zone="enemyField.lrigZone" cardback="lrig"/>
			<CardZone zone-name="check-zone" :zone="enemyField.checkZone"/>
			<CardZone zone-name="main-deck-zone" :zone="enemyField.mainDeck" is-hidden/>

			<div class="signi-zones block-style">
				<SigniZone zone-name="signi-zone1" :zone="enemyField.signiZones[0]" zone-index="0"/>
				<SigniZone zone-name="signi-zone2" :zone="enemyField.signiZones[1]" zone-index="1"/>
				<SigniZone zone-name="signi-zone3" :zone="enemyField.signiZones[2]" zone-index="2"/>
			</div>

			<CardZone zone-name="ener-zone" :zone="enemyField.enerZone"/>
			<CardZone zone-name="hand-zone" :zone="userField.hand" is-hidden/>
		</div>

		<div class="bottom-player-field">
			<CardZone zone-name="lrig-trash-zone" :zone="userField.lrigTrash" 
				is-public cardback="lrig"/>
			<CardZone zone-name="lrig-deck-zone" :zone="userField.lrigDeck" cardback="lrig"/>
			<CardZone zone-name="life-cloth-zone" :zone="userField.lifeCloth"/>
			<CardZone zone-name="trash-zone" :zone="userField.trash" is-public/>
			<LrigZone zone-name="lrig-zone" :zone="userField.lrigZone" 
				is-public cardback="lrig"/>
			<CardZone zone-name="check-zone" :zone="userField.checkZone" is-public/>
			<CardZone zone-name="main-deck-zone" :zone="userField.mainDeck" is-public/>

			<div class="signi-zones block-style">
				<SigniZone zone-name="signi-zone3" :zone="userField.signiZones[2]" 
					is-public zone-index="2"/>
				<SigniZone zone-name="signi-zone1" :zone="userField.signiZones[0]" 
					is-public zone-index="0"/>
				<SigniZone zone-name="signi-zone2" :zone="userField.signiZones[1]" 
					is-public zone-index="1"/>
			</div>

			<CardZone zone-name="ener-zone" :zone="userField.enerZone" is-public/>
			<CardZone zone-name="hand-zone" :zone="userField.hand"/>
		</div>

		<PopupChoice v-if="leaveGamePopup" message="Are you sure you want to leave?" v-on:yes-click="leaveGame" v-on:closed-modal="leaveGamePopup = false"></PopupChoice>
		<PopupChoice v-if="surrenderPopup" message="Are you sure you want to surrender? You'll become a card!" v-on:yes-click="surrender" v-on:closed-modal="surrenderPopup = false"></PopupChoice>
	</div>
	<!-- /Game block -->
</template>

<script>
import CardInfo from './../Deck_Editor/Card_Info.vue'
import PopupChoice from './../components/Popup_Choice.vue'
import CardZone from './Card_Zone.vue';
import LrigZone from './Lrig_Zone.vue';
import SigniZone from './Signi_Zone.vue';

export default {
  name: 'game',
	components: {
		CardInfo, CardZone, LrigZone, SigniZone, PopupChoice
	},
	sockets: {
		refreshGame(room) {
			this.$store.commit('changeCurrentRoom', room)
		},
		decksReady(gameState) {
			console.log(gameState);
			this.$store.commit('changeCurrentRoom', gameState)
		},
	},
	data() {
		return {
			// Game props
			hoveredCard: null,
			check: '',
			surrenderPopup: false,
			leaveGamePopup: false,
		}
	},
	computed: {
		// Current room.
		room () {
			return this.$store.state.currentRoom;
		},
		// boards
		enemyField () {
			for (let field of this.room.board) {
				if (field.player.nickname !== localStorage.getItem('Nickname')) {
					return field;
				}
			}
		},
		userField () {
			for (let field of this.room.board) {
				if (field.player.nickname === localStorage.getItem('Nickname')) {
					return field;
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
		surrender() {
			this.$socket.emit('surrender');
		},
		leaveGame() {
			this.$socket.emit('leaveGame');
		},

		// Dragging functionality.
		dragCard(event) {
			let card = event.target;
			if (card.tagName.toLowerCase() !== 'img' || !card.classList.contains('zone-card')) return;

			let originalZone = card.closest('[data-zone]');
			let originalZonePlace = card.closest('.visible-zone-card') || card.closest('.zone-content');
			let originalZoneName = card.closest('[data-zone]').dataset.zone;

			let lastZone = card.closest('[data-zone]');
			let currentZone = null;

			card.style.position = 'fixed';
			card.style.zIndex = '100';

			let shiftX = event.clientX - card.getBoundingClientRect().left;
			let shiftY = event.clientY - card.getBoundingClientRect().top;

			function moveCard (x, y) {
				card.style.left = x - shiftX + 'px';
				card.style.top = y - shiftY + 'px';
			}

			function getZoneUnderCard (x, y) {
				card.hidden = true;
				let elemBelow = document.elementFromPoint(x, y);
				card.hidden = false;
				return elemBelow;
			}

			function dragging (event) {
				moveCard(event.clientX, event.clientY);
				if (lastZone) {
					lastZone.classList.remove('is-lightened');
				}
				lastZone = currentZone;
				currentZone = getZoneUnderCard(event.clientX, event.clientY);
				if (currentZone) {
					currentZone.classList.add('is-lightened');
				}

			}

			function releasing (event) {
				if (currentZone) {

				}

				// Reset styles. Remove listeners.
				card.style.position = '';
				card.style.zIndex = '';
				card.style.left = '';
				card.style.top = '';
				document.removeEventListener('mousemove', dragging);
				document.removeEventListener('mouseup', releasing);
			}

			document.addEventListener('mousemove', dragging);
			document.addEventListener('mouseup', releasing);

		}
	},
	mounted() {
		this.$forceUpdate()
	}
}
</script>
