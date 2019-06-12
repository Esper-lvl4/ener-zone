<template>
  <div class="save-deck-block block-style-thick">
    <label>Enter deck name:</label>
    <input class="main-input" type="text" name="deck-name" v-model="deckName">
    <button class="main-button" @click.prevent="saveDeck">Done</button>
  </div>
</template>
<script>
export default {
  name: "save-deck",
  props: [
    'main', 'lrig', 'validity'
  ],
  data: () => ({
    deckName: '',
  }),
  computed: {
    mainDeck() {
      return this.main;
    },
    lrigDeck() {
      return this.lrig;
    }
  },
  methods: {
		isValid() {
			let mainCount = 0;
			let lrigCount = 0;
			for(let card of this.mainDeck) {
				mainCount += card.quantity;
			}
			for(let card of this.lrigDeck) {
				lrigCount += card.quantity;
			}
			return mainCount === 40 && lrigCount === 10;
		},
    saveDeck() {
	  	if (this.deckName.length < 3) {
	  		this.$store.commit('errorMessage', 'Deck name should be at lease 3 characters long.');
	  		return;
	  	}
			let mainDeck = [];
			for (let card of this.mainDeck) {
				mainDeck.push(`${card._id}(_${card.quantity}_)`);
			}
			let lrigDeck = [];
			for (let card of this.lrigDeck) {
				lrigDeck.push(`${card._id}(_${card.quantity}_)`);
			}
	  	let deck = {name: this.deckName, valid: this.isValid, mainDeck, lrigDeck}
			console.log(deck);
	  	this.$socket.emit('saveDeck', deck);
      this.$emit('close-modal', event);
	  },
  }
}
</script>
