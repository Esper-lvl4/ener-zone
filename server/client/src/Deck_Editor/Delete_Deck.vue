<template>
  <div class="delete-list-block block-style-thick">
    <ul class="delete-list" @click.prevent="deleteAlert">
      <li v-for="deck in userDecks"><a :href="deck.name">{{deck.name}}</a></li>
      <li @click.stop="closeModals">Cancel</li>
    </ul>

    <div class="alert-wrap" v-if="deleteAlertModal.active">
      <div class="delete-alert">
        <p>Are you sure, you want to delete a deck named: "{{deleteAlertModal.deckName}}"?</p>
        <button class="main-button" @click="deleteDeck(deleteAlertModal.deckName)">Yes</button>
        <button class="main-button" @click="closeModals">Cancel</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "delete-deck",
  data: () => ({
    deleteAlertModal: {
      active: false,
      deckName: '',
    },
  }),
  computed: {
    userDecks() {
      return this.$store.state.userDecks;
    }
  },
  methods: {
    closeModals() {
      this.$emit('close-modal');
    },
    deleteAlert() {
      if (event.target.tagName !== 'A') return;
      let name = event.target.getAttribute('href');
      this.deleteAlertModal.active = true;
      this.deleteAlertModal.deckName = name;
    },
    deleteDeck(name) {
      this.$socket.emit('getDeck', name, 'delete');
      this.deleteAlertModal.active = false;
      this.deleteAlertModal.deckName = '';
    }
  }
}
</script>
