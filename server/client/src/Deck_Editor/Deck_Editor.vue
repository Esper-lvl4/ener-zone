<template>
  <div class="deck-editor-wrap" id="deck-editor">
    <CardInfo :cardInfo="cardInfo"/>
    <main>
    	<CardList @card-hover="cardHover" @deck-update="updateDeck" />
    	<DeckManage @cleared-editor="clearEditor" :main="mainDeck" :lrig="lrigDeck"/>
      <DeckBlock type="main" title="Main Deck" :deck="mainDeck" @card-hover="deckHover" @card-click="deckClick" />
      <DeckBlock type="lrig" title="LRIG Deck" :deck="lrigDeck" @card-hover="deckHover" @card-click="deckClick" />
  	</main>
	</div>
</template>

<script>
import CardInfo from './Card_Info.vue';
import CardList from './Card_List.vue';
import DeckManage from './Deck_Manage.vue';
import DeckBlock from './Deck_block.vue';

export default {
  name: 'deck-editor',
  components: {
    CardInfo, CardList, DeckManage, DeckBlock,
  },
  sockets: {
		giveDatabase(data) {
			this.$store.commit('saveDatabase', data);
		},
    sentDecks(decks) {
      this.$store.commit('saveDecks', decks);
    },
    loadedDeck(deck) {
      this.deckName = deck.name;
      this.mainDeck = deck.mainDeck;
      this.lrigDeck = deck.lrigDeck;
    },
    deletedDeck(decks) {
      this.userDecks = decks;
    },
  },
  data() {
  	return {
      cardInfo: null,
      mainDeck: [],
      lrigDeck: [],
  	};
  },
  computed: {
    database() {
      return this.$store.state.database;
    },
    filteredDatabase() {
      return this.$store.state.filteredDatabase;
    },
  },
  methods: {
    // Called when this component is mounted. Gets and writes to store the whole card database.
  	getDatabase() {
      let db = this.database;
      
      if (!db) {
        setTimeout(() => {
	  			this.$socket.emit('getDatabase', 'pls');
	  		}, 0)
      }
  	},

    // Clear decks to create new one.
    clearEditor() {
      this.mainDeck = [];
      this.lrigDeck = [];
  	},

    // Pass the hovered card to CardInfo component via prop.
    cardHover(card) {
      this.cardInfo = card;
    },

    // Get card to pass to CardInfo component.
    deckHover({event, deckType}) {
      if (event.target.tagName !== 'IMG') return;

  		let number = event.target.parentElement.getAttribute('data-number');
      this.cardHover(this[deckType][number]);
    },

    // Remove cards from deck, when clicking on them.
    deckClick(event, deck) {
      if (!event.target || event.target.tagName !== 'IMG') return;

      let number = event.target.parentElement.getAttribute('data-number');
      this.updateDeck({card: this[deckType][number], action: 'remove'})
    },

    // Manage decks. Can add or remove card. If ther ei smore then 1 card,
    // no new objects are added, instead quantity prop rises.
    updateDeck ({card, action}) {
      let type = card.type.toLowerCase();
      let deck = type === 'signi' || type === 'spell' ? 'mainDeck' : 'lrigDeck';

      let index = this.cardInDeck(card.name, deck);

      // Adding card.
      if (action === 'add') {
        // Dont let players add more then 1 copy of a card in lrig deck. Up to 4 for main deck.
        if (index !== false && this[deck][index].quantity < 4 && deck !== 'lrigDeck') {
          this[deck][index].quantity++;
        }
        
        if (index === false) {
          card.quantity = 1;
          this[deck].push(card);
        }
      }
      
      // removing card.
      if (action === 'remove' && this[deck][index]) {
        this[deck][index].quantity--;
        if (this[deck][index].quantity === 0) {
          delete this[deck][index].quantity;
          this[deck].splice(index, 1);
        }
      }

      // Bypassing Vue's inability to update number of cards in decks, when stored this way.
      this.$forceUpdate();
    },

    // Check if card is in a deck, by her name. Used in this.updateDeck.
    cardInDeck(name, deck) {
      for (let i = 0; i < this[deck].length; i++) {
        if (this[deck][i].name == name) return i;
      }
      return false;
    }
  },
  mounted() {
  	this.getDatabase();
  },
}
</script>
