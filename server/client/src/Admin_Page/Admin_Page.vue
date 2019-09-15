<template>
  <div id="admin-page">
    <button @click="parse">Parser</button>
  </div>
</template>

<script>
export default {
  name: 'admin-page',
	data() {
		return {
			db: [],
		}
	},
	sockets: {
		parsed(data) {
			this.db = data;
		}
	},
	methods: {
		parse() {
			this.$socket.emit('parse');
		}
	},
}
</script>
