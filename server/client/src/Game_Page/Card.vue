<template>
  <img class="zone-card"
    :width="width"
    :height="height"
    :src="card.image"
    :alt="alt || card.name">
</template>
<script>
  export default {
    name: 'card',
    props: {
      card: {
        type: Object,
        default: () => ({}),
      },
      alt: String,
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
  }
</script>