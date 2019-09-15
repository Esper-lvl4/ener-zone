<template>
	<div class="modal-window" @click.self="toggleModal()">
		<div class="modal-wrap block-style">
			<div class="info-block info">{{message}}</div>
			<div class="modal-close" @click="toggleModal()"></div>
			<slot></slot>
			<button class="main-button" @click.prevent="yesClick()">Yes</button>
			<button class="main-button" @click.prevent="noClick()">No</button>
		</div>
	</div>
</template>
<script>
export default {
  name: "popup-choice",
	props: [
		'message'
	],
  data: () => ({

  }),
	methods: {
		toggleModal() {
			this.$emit('closed-modal');
		},
		yesClick () {
			this.$emit('yes-click');
			this.toggleModal();
		},
		noClick () {
			this.$emit('no-click');
			this.toggleModal();
		},
	}
}
</script>
