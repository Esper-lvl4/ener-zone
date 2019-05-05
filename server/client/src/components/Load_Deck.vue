<template>
  <div class="deck-list-block block-style-thick">
    <ul class="deck-list" @click.prevent="loadDeck">
      <li v-for="deck in userDecks"><a :href="deck.name">{{deck.name}}</a></li>
      <li @click="closeModals">Cancel</li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "load-deck",
  computed: {
    userDecks() {
      return this.$store.state.userDecks;
    }
  },
  methods: {
    closeModals() {
      this.$emit('close-modal');
    },
    loadDeck() {
      if (event.target.tagName !== 'A') return;
      let name = event.target.getAttribute('href');
      this.$socket.emit('getDeck', name, 'load');
      this.closeModals();
    },
  }
}
</script>
