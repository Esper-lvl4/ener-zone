<template>
  <img
    :width="card.type.toLowerCase() == 'key' ? 550 : 392"
    :height="card.type.toLowerCase() == 'key' ? 392 : 550"
    :src="card.image"
    :alt="card.name"
    :data-number="index">
</template>
<script>
export default {
  name: "card-list-item",
  props: {
    card: {
      type: Object,
      default: () => ({}),
    },
    index: Number,
  },
}
</script>
