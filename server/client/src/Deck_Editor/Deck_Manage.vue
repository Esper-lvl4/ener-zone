<template>
  <div class="deck-manage-wrap block-style" @click.stop>
    <div class="deck-manage">
      <button @click="clearEditor">New deck</button>
      <button @click.stop="manageModals('load')">Load deck</button>
      <button @click.stop="manageModals('save')">Save deck</button>
      <button @click.stop="manageModals('delete')">Delete deck</button>
      <button @click.stop="manageModals('filter')">Filter</button>
      <router-link to="/lobby" class="exit-de" tag="a">lobby</router-link>

      <LoadDeck v-if="loadDeckModal" @close-modal="closeModals" />

      <DeleteDeck v-if="deleteDeckModal" @close-modal="closeModals" />

      <SaveDeck :main="main" :lrig="lrig" v-if="saveDeckModal" @close-modal="closeModals" />

      <DetailedFilter v-if="filterModal" @close-modal="closeModals" />
    </div>
  </div>
</template>
<script>
import SaveDeck from './Save_Deck.vue'
import LoadDeck from './../components/Load_Deck.vue'
import DeleteDeck from './Delete_Deck.vue'
import DetailedFilter from './Detailed_Filter.vue'

export default {
  name: "deck-manage",
  components: {
    SaveDeck, LoadDeck, DeleteDeck, DetailedFilter,
  },
  props: [
    'main', 'lrig'
  ],
  data: () => ({
    saveDeckModal: false,
    loadDeckModal: false,
    deleteDeckModal: false,
    filterModal: false,
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
    clearEditor() {
      this.closeModals();
      this.$emit('cleared-editor');
    },
	  manageModals(modal) {
      this.closeModals();
	  	switch (modal) {
				case 'save':
	  			this.saveDeckModal = true;
	  			break;
	  		case 'load':
	  			this.loadDeckModal = true;
          this.showDecks();
	  			break;
	  		case 'delete':
	  			this.deleteDeckModal = true;
          this.showDecks();
	  			break;
	  		case 'filter':
	  			this.filterModal = true;
	  			break;
	  	}
	  },
    closeModals() {
      this.saveDeckModal = false;
      this.loadDeckModal = false;
      this.deleteDeckModal = false;
      this.filterModal = false;
    },
    showDecks() {
      if (!this.$store.state.userDecks) {
        this.$socket.emit('showDecks');
      }
    },
  },
  mounted() {
    let deckEditor = document.getElementById('deck-editor');
    deckEditor.addEventListener('click', function (event) {
      this.closeModals();
    }.bind(this));
  }
}
</script>
