<template>
  <div class="search-block block-style">
    <form class="search-block-form">
      <input class="search-field main-input" type="text" v-model="filterName">
      <button class="more-button none" @click="showMoreCards(20)">More cards</button>
    </form>
    <div class="search-result" @mouseover="cardHover($event)" @click.prevent="cardClick($event, 'visible', 'add')">
      <img v-for="(visibleCard, index) in visibleCards"
        :width="visibleCard.type.toLowerCase() == 'key' ? 550 : 392"
        :height="visibleCard.type.toLowerCase() == 'key' ? 392 : 550"
        :src="visibleCard.image"
        :alt="visibleCard.name"
        :data-number="index">
    </div>
  </div>
</template>
<script>
export default {
  name: "card-list",
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
      let array = [];
      let origin = null;
      if (this.filteredDatabase) {
        origin = this.filteredDatabase;
      } else if (this.database) {
        origin = this.database;
      }
      // Check for origin just in case it's still null when this computed property is being calculated.
      // It will just return empty array, when origin is not present.
      if (origin) {
        // filter the cards array by name, before showing stated amout of cards to the user.
        origin = this.filterByName(origin);
        for (let i = 1; i <= this.visibleCount; i++) {
          if (i-1 == origin.length) {break;}
          array.push(origin[i-1]);
        }
      }
      return array;
    },
  },
  methods: {
    cardHover(event) {
  		if (event.target.tagName !== 'IMG') {
  			return;
  		}
  		let number = event.target.getAttribute('data-number');
			this.$emit('card-hover', this.visibleCards[number]);
  	},
    cardClick(event, where, action) {
      if (event.target.tagName !== 'IMG') {
  			return;
  		}
  		let number = event.target.getAttribute('data-number');
			this.$emit('deck-update', {card: this.visibleCards[number], action: action});
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
  		for (var i = from; i < to; i++) {
				newCards.push(origin[i]);
			}
      this.visibleCards.concat(newCards);
  	},
    filterByName(array) {
      if (this.filterName === '') {return array};
      let filteredArray = [];
      if (array.length !== 0) {
        for (let i = 0; i < array.length; i++) {
          if (!array[i].name) {
            continue;
          }
          if (array[i].name.match(this.filterName)) {
            filteredArray.push(array[i]);
          }
        }
      }
      return filteredArray;
    },
  }
}
</script>
