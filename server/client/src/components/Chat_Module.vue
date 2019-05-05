<template>
	<div class="lobby-chat-block" id="chat">
		<div class="chat-buttons block-style">
			<button class="js-active-button" @click.prevent="changeChatTab('chat')">Chat</button>
			<button @click.prevent="changeChatTab('room')">Room Chat</button>
		</div>
		<div class="chat-tab tab block-style">
			<ul class="not-a-list">
				<li v-for="(message, index) in chatHistory" :key="index">[{{message.time}}] {{message.nickname}}: {{message.text}}</li>
			</ul>
		</div>
		<div class="server-tab tab" :class="{'js-none': activeTab !== 'room'}">
			<ul class="not-a-list">
				<li v-for="(message, index) in roomHistory" :key="index">[{{message.time}}] {{message.nickname}}: {{message.text}}</li>
			</ul>
		</div>
		<div class="message-field-wrap block-style">
			<input class="chat-message-field main-input" v-model="messageInput" type="text" name="chat-message-field" @keypress.enter="postMessage()">
			<button class="main-button" @click="postMessage()">Send</button>
		</div>
	</div>
</template>

<script>
export default {
	name: "chat-module",
	data: () => ({
		chatHistory: [],
		roomHistory: [],
		activeTab: 'chat',
		messageInput: '',
		messagesIsForbidden: false,
	}),
	methods: {
		refreshChat(data) {
			if (!data) {
				console.log('No chat data were sent by server!');
				return;
			}
			this.chatHistory =	data;
		},
		refreshRoomChat(data) {
			this.roomHistory = data;
			console.log(this.roomHistory);
		},
		// Socket emits (chat).

		postMessage: function () {
			if (this.messageInput == '' || this.messagesIsForbidden) {
				return;
			}
			this.messagesIsForbidden = true;
			let date = new Date();
			date = date.getHours() + ':' + date.getMinutes();
			let message = {
				time: date,
				nickname: localStorage.getItem('Nickname'),
				text: this.messageInput,
			}
			if (this.activeTab === 'chat') {
				this.$socket.emit('chatMessage', message);
			} else if (this.activeTab === 'room') {
				this.$socket.emit('roomMessage', message);
			}

			this.messageInput = '';
			setTimeout(this.allowMessages, 1000);
		},
		// Chat methods.

		changeChatTab: function (tab) {
			if (!tab) {
				return;
			} else {
				this.activeTab = tab;
			}
		},
		allowMessages: function () {
			this.messagesIsForbidden = false;
		},
	},
	mounted() {
		this.$socket.emit('getChatHistory');
	}
}
</script>
