<template>
  <div :class="type + '-deck'">
    <h2 class="deck-titles">{{title}}</h2>
    <div :class="type + '-card-block block-style'" 
      @mouseover="deckHover($event, type + 'Deck')" 
      @click="deckClick($event, type + 'Deck')"
    >
      <div class="card" v-for="(card, index) in deck" :key="type + '-deck-' + index" :data-number="index">
        <img
          :src="card.image"
          :alt="card.name"
          :width="card.type.toLowerCase() == 'key' ? 550 : 392"
          :height="card.type.toLowerCase() == 'key' ? 392 : 550">
        <div class="card-count">{{card.quantity}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'deck-block',
    props: {
      type: {
        type: String,
        default: '',
      },
      title: {
        type: String,
        default: 'Deck',
      },
      deck: {
        type: Array,
        default: () => ([]),
      },
    },
    methods: {
      deckHover(event, deckType) {
        this.$emit('card-hover', {event, deckType});
      },
      deckClick(event, deckType) {
        console.log(event, deckType);
        this.$emit('card-click', {event, deckType});
      },
    },
  }
</script>