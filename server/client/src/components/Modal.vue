<template>
	<div class="modal-window" @click.self="toggleModal()">
		<div class="modal-wrap block-style">
			<div class="info-block info">{{error}}</div>
			<div class="modal-close" @click="toggleModal()"></div>
			<slot></slot>
			<button class="main-button" v-if="ok" @click.prevent="toggleModal()">Ok</button>
		</div>
	</div>
</template>
<script>
export default {
  name: "modal-wrap",
	props: [
		'ok'
	],
  data: () => ({

  }),
	computed: {
		error() {
			return this.$store.state.errorMessage;
		}
	},
	methods: {
		toggleModal() {
			this.$emit('closed-modal');
		}
	}
}
</script>
