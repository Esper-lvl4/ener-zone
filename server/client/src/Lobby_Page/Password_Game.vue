<template>
	<form class="game-password-modal" @submit.prevent="checkRoomPassword($event)" autocomplete="off">
		<span>Enter password to join this room.</span>
		<input class="main-input" type="text" name="enter-game-password" v-model="password">
		<button class="main-button">Join</button>
	</form>
</template>
<script>
export default {
  name: "password-game",
	props: [
		'room'
	],
  data: () => ({
		password: '',
  }),
	methods: {
		checkRoomPassword(event) {
			if (!this.room) return;
			if (this.password === this.room.settings.password) {
				this.$emit('join-room', 'player');
			} else {
				this.$store.commit('errorMessage', 'Wrong password');
				this.$emit('closed-modal');
			}
		},
	}
}
</script>
