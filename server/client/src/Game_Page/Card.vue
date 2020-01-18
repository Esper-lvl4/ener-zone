<template>
  <img class="zone-card"
    :width="width"
    :height="height"
    :src="card.image"
    :alt="alt || card.name"
    @mouseenter="cardHover"
    @mousedown="startDrag($event)"
    @dragstart.prevent
  />
</template>
<script>
  import eventBus from '@/EventBus/EventBus.js';
  import dragger from '@/EventBus/drag_n_drop.js';

  export default {
    name: 'card',
    props: {
      card: {
        type: Object,
        default: () => ({}),
      },
      alt: String,
      zone: String,
      index: Number,
    },
    data: () => ({

    }),
    computed: {
      width() {
        return this.card.type.toLowerCase() === 'key' ? 550 : 392;
      },
      height() {
        return this.card.type.toLowerCase() === 'key' ? 392 : 550;
      },
    },
    methods: {
      cardHover() {
        eventBus.emit('card-hover', this.card);
      },
      startDrag(event) {
        dragger.emit('start-drag', {event, card: this.card});
      },
    },
  }
</script>