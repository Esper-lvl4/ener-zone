<template>
  <div class="search-block block-style">
    <form class="search-block-form" @submit.prevent>
      <input class="search-field main-input" type="text" v-model="filterName">
      <button class="more-button none" @click="showMoreCards(20)">More cards</button>
    </form>
    <div class="search-result" @mouseover="cardInteraction($event)" @click.prevent="cardInteraction($event, 'add')">
      <CardListItem :card="visibleCard" :index="index"
        v-for="(visibleCard, index) in visibleCards" :key="'list-card-' + index" 
      />
    </div>
  </div>
</template>
<script>
import CardListItem from './Card_List_Item';

export default {
  name: "card-list",
  components: {
    CardListItem,
  },
  data: () => {
    return {
      filterName: '',
      visibleCount: 20,
    }
  },
  computed: {
    database(){
      return this.$store.state.database;
    },
    filteredDatabase() {
      return this.$store.state.filteredDatabase;
    },
    visibleCards() {
      let origin = this.filteredDatabase || this.database;

      if (!origin) return [];

      // filter the cards array by name, before showing stated amout of cards to the user.
      const array = [];
      
      origin = this.filterByName(origin);
      for (let i = 1; i <= this.visibleCount; i++) {
        if (i - 1 === origin.length) break;
        array.push(origin[i-1]);
      }
      return array;
    },
  },
  methods: {
    cardInteraction(event, action) {
      if (event.target.tagName !== 'IMG') return;

      const number = event.target.getAttribute('data-number');

      if (number === null && number === '') return;

      if (event.type === 'mouseover') {
        this.$emit('card-hover', this.visibleCards[number]);
      }
      if (event.type === 'click') {
        this.$emit('deck-update', {card: this.visibleCards[number], action});
      }
  	},
    showMoreCards(number = 20) {
      let from = this.visibleCount + 1;
      this.visibleCount += number;
      let to = this.visibleCount;
      let newCards = [];
      let origin = this.filteredDatabase.length !== 0 ? this.filteredDatabase : this.database;

  		for (let i = from; i < to; i++) {
				newCards.push(origin[i]);
			}
      this.visibleCards.concat(newCards);
  	},
    filterByName(array) {
      if (this.filterName === '' || array.length === 0) return array;

      return array.filter(card => {
        return card.name && card.name.match(this.filterName) !== null;
      });
    },
  }
}
</script>
