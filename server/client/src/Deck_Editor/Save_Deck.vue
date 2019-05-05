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
    'main', 'lrig',
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
    },
  },
  methods: {
    saveDeck() {
	  	if (this.deckName.length < 3) {
	  		this.$store.commit('errorMessage', 'Deck name should be at lease 3 characters long.');
	  		return;
	  	}
	  	let deck = {name: this.deckName, mainDeck: this.mainDeck, lrigDeck: this.lrigDeck}
	  	this.$socket.emit('saveDeck', deck);
      this.$emit('close-modal', event);
	  },
  }
}
</script>
