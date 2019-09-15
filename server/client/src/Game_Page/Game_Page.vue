<template>
	<!-- Game block -->
	<div class="game-wrap wrap-size" v-on:card-hover="cardHover">
		<nav class="game-nav">
			<button class="main-button surrender" @click="surrenderPopup = true;">Surrender</button>
			<button class="main-button leave-game" @click="leaveGamePopup = true;">Leave game</button>
		</nav>
		<CardInfo :card-info="hoveredCard"/>
		<div class="top-player-field">
			<CardZone
			class="lrig-trash-zone" :zone="enemyField.lrigTrash"
			:is-hidden="false" cardback="/src/assets/img/card-back-lrig-deck.jpg"/>
			<CardZone class="lrig-deck-zone" :zone="enemyField.lrigDeck" :is-hidden="true" cardback="/src/assets/img/card-back-lrig-deck.jpg"/>
			<CardZone class="life-cloth-zone" :zone="enemyField.lifeCloth" :is-hidden="true" cardback="/src/assets/img/card-back.jpg"/>
			<CardZone class="trash-zone" :zone="enemyField.trash" :is-hidden="false" cardback="/src/assets/img/card-back.jpg"/>
			<LrigZone class="lrig-zone" :zone="enemyField.lrigZone" :is-hidden="false" cardback="/src/assets/img/card-back-lrig-deck.jpg"/>
			<CardZone class="check-zone" :zone="enemyField.checkZone" :is-hidden="false"/>
			<CardZone class="main-deck-zone" :zone="enemyField.mainDeck" :is-hidden="true" cardback="/src/assets/img/card-back.jpg"/>

			<div class="signi-zones block-style">
				<SigniZone class="signi-zone1" :zone="enemyField.signiZones[0]" :is-hidden="false" cardback="/src/assets/img/card-back.jpg"/>
				<SigniZone class="signi-zone2" :zone="enemyField.signiZones[1]" :is-hidden="false" cardback="/src/assets/img/card-back.jpg"/>
				<SigniZone class="signi-zone3" :zone="enemyField.signiZones[2]" :is-hidden="false" cardback="/src/assets/img/card-back.jpg"/>
			</div>

			<CardZone class="ener-zone" :zone="enemyField.enerZone" :is-hidden="false" cardback="/src/assets/img/card-back.jpg"/>
			<CardZone class="hand-zone" :zone="userField.hand" :is-hidden="true" cardback="/src/assets/img/card-back.jpg"/>
		</div>

		<div class="bottom-player-field">
			<CardZone class="lrig-trash-zone" :zone="userField.lrigTrash" :is-public="true" cardback="/src/assets/img/card-back-lrig-deck.jpg" zone-name="lrigTrash"/>
			<CardZone class="lrig-deck-zone" :zone="userField.lrigDeck" :is-public="false" cardback="/src/assets/img/card-back-lrig-deck.jpg" zone-name="lrigDeck"/>
			<CardZone class="life-cloth-zone" :zone="userField.lifeCloth" :is-public="false" cardback="/src/assets/img/card-back.jpg" zone-name="lifeCloth"/>
			<CardZone class="trash-zone" :zone="userField.trash" :is-public="true" cardback="/src/assets/img/card-back.jpg" zone-name="trash"/>
			<LrigZone class="lrig-zone" :zone="userField.lrigZone" :is-public="true" cardback="/src/assets/img/card-back-lrig-deck.jpg" zone-name="lrigZone"/>
			<CardZone class="check-zone" :zone="userField.checkZone" :is-public="true" zone-name="checkZone"/>
			<CardZone class="main-deck-zone" :zone="userField.mainDeck" :is-public="false" cardback="/src/assets/img/card-back.jpg" zone-name="mainDeck"/>

			<div class="signi-zones block-style">
				<SigniZone class="signi-zone1" :zone="userField.signiZones[0]" :is-public="true" cardback="/src/assets/img/card-back.jpg" zone-name="signiZones" zone-index="0"/>
				<SigniZone class="signi-zone2" :zone="userField.signiZones[1]" :is-public="true" cardback="/src/assets/img/card-back.jpg" zone-name="signiZones" zone-index="1"/>
				<SigniZone class="signi-zone3" :zone="userField.signiZones[2]" :is-public="true" cardback="/src/assets/img/card-back.jpg" zone-name="signiZones" zone-index="2"/>
			</div>

			<CardZone class="ener-zone" :zone="userField.enerZone" :is-public="true" cardback="/src/assets/img/card-back.jpg" zone-name="enerZone"/>
			<CardZone class="hand-zone" :zone="userField.hand" :is-public="false" cardback="/src/assets/img/card-back.jpg" zone-name="hand"/>
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
	components: {CardInfo, CardZone, LrigZone, SigniZone, PopupChoice},
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
