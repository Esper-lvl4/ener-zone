<template>
  <div class="deck-editor-wrap" id="deck-editor">
    <CardInfo :cardInfo="card"/>
    <main>
    	<CardList @card-hover="cardHover" @deck-update="updateDeck" />
    	<DeckManage @cleared-editor="clearEditor" :main="mainDeck" :lrig="lrigDeck"/>
      <div class="main-deck">
        <h2 class="deck-titles">Main Deck</h2>
        <div class="main-card-block block-style" @mouseover="deckCardHover($event, 'mainDeck')" @click="deckClick($event, 'mainDeck')">
          <div class="card" v-for="(mainCard, index) in mainDeck" :data-number="index">
            <img
              :src="mainCard.image"
              :alt="mainCard.name"
              :width="mainCard.type.toLowerCase() == 'key' ? 550 : 392"
              :height="mainCard.type.toLowerCase() == 'key' ? 392 : 550">
            <div class="card-count">{{mainCard.quantity}}</div>
          </div>
        </div>
      </div>
      <div class="lrig-deck">
        <h2 class="deck-titles">LRIG Deck</h2>
        <div class="lrig-card-block block-style" @mouseover="deckCardHover($event, 'lrigDeck')" @click="deckClick($event, 'lrigDeck')">
          <div class="card" v-for="(lrigCard, index) in lrigDeck" :data-number="index">
            <img
              :src="lrigCard.image"
              :alt="lrigCard.name"
              :width="lrigCard.type.toLowerCase() == 'key' ? 550 : 392"
              :height="lrigCard.type.toLowerCase() == 'key' ? 392 : 550">
            <div class="card-count">{{lrigCard.quantity}}</div>
          </div>
        </div>
      </div>
  	</main>
	</div>
</template>

<script>
import CardInfo from './Card_Info.vue';
import CardList from './Card_List.vue';
import DeckManage from './Deck_Manage.vue';

export default {
  name: 'deck-editor',
  components: {
    CardInfo, CardList, DeckManage
  },
  sockets: {
		giveDatabase(data) {
			this.$store.commit('saveDatabase', data);
			console.log(data);
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
      card: null,

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

	  	if (db !== null) {
				console.log(db)
	  	} else {
	  		setTimeout(function () {
	  			this.$socket.emit('getDatabase', 'pls');
	  		}.bind(this), 0)
	  	}
  	},

    // Clear decks to create new one.
    clearEditor() {
      this.mainDeck = [];
      this.lrigDeck = [];
  	},

    // Pass the hovered card to CardInfo component via prop.
    cardHover(card) {
      this.card = card;
    },

    // Get card to pass to CardInfo component.
    deckCardHover(event, deck) {
      if (event.target.tagName !== 'IMG') {
  			return;
  		}
  		let number = event.target.parentElement.getAttribute('data-number');
      this.cardHover(this[deck][number]);
    },

    // Remove cards from deck, when clicking on them.
    deckClick(event, deck) {
      if (event.target.tagName !== 'IMG') {
  			return;
  		}
      let number = event.target.parentElement.getAttribute('data-number');
      this.updateDeck({card: this[deck][number], action: 'remove'})
    },

    // Manage decks. Can add or remove card. If ther ei smore then 1 card,
    // no new objects are added, instead quantity prop rises.
    updateDeck ({card, action}) {
      let type = card.type.toLowerCase();
      let deck = '';

      // Decide, which deck we are managing right now.
      if (type == 'signi' || type == 'spell') {
        deck = 'mainDeck';
      } else {
        deck = 'lrigDeck'
      }

      // Adding card.
      if (action == 'add') {
        let index = this.cardInDeck(card.name, deck);
        // Dont let players add more then 1 copy of a card in lrig deck. Up to 4 for main deck.
        if (index !== false && this[deck][index].quantity < 4 && deck !== 'lrigDeck') {
          this[deck][index].quantity++;
        } else if (index === false) {
          card.quantity = 1;
          this[deck].push(card);
        }
      // removing card.
      } else if (action == 'remove') {
        let index = this.cardInDeck(card.name, deck);
        this[deck][index].quantity--;
        if (this[deck][index].quantity == 0) {
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
