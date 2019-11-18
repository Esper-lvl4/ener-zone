<template>
  <div class="search-block block-style">
    <form class="search-block-form" @submit.prevent>
      <input class="search-field main-input" type="text" v-model="filterName">
      <button class="more-button none" @click="showMoreCards(20)">More cards</button>
    </form>
    <div class="search-result" @mouseover="cardInteraction($event)" @click.prevent="cardInteraction($event, 'add')">
        <CardListItem :card="visibleCard" v-for="(visibleCard, index) in visibleCards" :key="'list-card-' + index" />
    </div>
  </div>
</template>
<script>
import CardListItem from './CardListItem';

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
      let origin = null;
      if (this.filteredDatabase) {
        origin = this.filteredDatabase;
      } else if (this.database) {
        origin = this.database;
      }
      // Check for origin just in case it's still null when this computed property is being calculated.
      if (!origin) return [];

      // filter the cards array by name, before showing stated amout of cards to the user.
      const array = [];
      
      origin = this.filterByName(origin);
      for (let i = 1; i <= this.visibleCount; i++) {
        if (i-1 == origin.length) {break;}
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
        this.$emit('deck-update', {card: this.visibleCards[number], action: action});
      }
  	},
    showMoreCards(number = 20) {
      let from = this.visibleCount + 1;
      this.visibleCount += number;
      let to = this.visibleCount;
      let newCards = [];
      let origin = null;
      if (this.filteredDatabase.length !== 0) {
        origin = this.filteredDatabase;
      } else {
        origin = this.database;
      }
  		for (let i = from; i < to; i++) {
				newCards.push(origin[i]);
			}
      this.visibleCards.concat(newCards);
  	},
    filterByName(array) {
      if (this.filterName === '') return array;

      if (array.length !== 0) return [];

      // TODO use .filter method instead.
      const filteredArray = [];
      for (let i = 0; i < array.length; i++) {
        if (!array[i].name) continue;

        if (array[i].name.match(this.filterName)) {
          filteredArray.push(array[i]);
        }
      }
      return filteredArray;
    },
  }
}
</script>
