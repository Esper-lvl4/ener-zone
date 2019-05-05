<template>
	<form class="create-room-form" id="create-room-form" @submit.prevent="createRoom" autocomplete="off">
		<label for="room-name">Room name:</label>
		<input class="main-input" type="text" name="room-name" v-model="roomCreationObj.name">
		<label for="room-format">Game format:</label>
		<input class="main-input" name="room-format" type="text" v-model="roomCreationObj.settings.format">
		<ul class="room-format-list not-a-list js-none" @click="setFormat()">
			<li v-for="format in formats">{{format}}</li>
		</ul>
		<label for="room-time-limit">Time limit (seconds):</label>
		<input class="main-input" type="text" name="room-time-limit" v-model="roomCreationObj.settings.timeLimit">
		<label for="room-password">Protect with password:</label>
		<input class="main-input" type="text" name="room-password" v-model="roomCreationObj.settings.password">
		<button class="main-button">Create</button>
	</form>
</template>
<script>
export default {
  name: "create-room",
  data: () => ({
		roomCreationObj: {
			name: '',
			settings: {
				format: 'as',
				timeLimit: '180',
				password: '',
			},
		},
		formats: [
			'All Stars', 'Key Selection', "No Mayu's Room"
		],
  }),
	methods: {
		setFormat() {
			if (event.target.tagName.toLowerCase() == 'li') {
				let result = '';
				if (event.target.innerHTML.match('All Stars')) {
					result = 'as';
				} else if (event.target.innerHTML.match('Key Selection')) {
					result = 'ks';
				} else if (event.target.innerHTML.match("No Mayu's Room")) {
					result = 'nb';
				}
				this.roomCreationObj.format = result;
			}
		},
		createRoom: function () {
			if (this.roomCreationObj.name.length < 3) return;
			this.$socket.emit('createRoom', this.roomCreationObj);
			this.$emit('closed-modal');
		},
	}
}
</script>
