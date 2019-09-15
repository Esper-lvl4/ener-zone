<template>
  <div id="auth-page">

  	<button v-if="!regForm.show && !loginForm.show" class="main-button" @click="showLoginForm">Login</button>
		<button v-if="!regForm.show && !loginForm.show" class="main-button" @click="showRegForm">Sign Up</button>

    <!-- Login popup -->

		<div class="login-wrap" v-if="loginForm.show" @click.self="closeModals">
			<form class="login-form block-style">
				<div class="info">{{loginForm.info}}</div>
				<label>Username</label>
				<input class="main-input" type="text" name="username" v-model="loginForm.name"
				v-on="{input: clearErrors, focus: clearErrors, change: clearErrors}">
				<label>Password</label>
				<input class="main-input" type="text" name="password" v-model="loginForm.password"
				v-on="{input: clearErrors, focus: clearErrors, change: clearErrors}">
				<label>Remember me</label>
				<input class="main-input" type="checkbox" name="remember" v-model="loginForm.remember">
				<button class="main-button" @click.prevent="submitLogin">Log in</button>
			</form>
		</div>

		<!-- Sign Up popup -->

		<div class="sign-up-wrap" v-if="regForm.show" @click.self="closeModals">
			<form class="sign-up-form block-style">
				<div class="info">{{regForm.info}}</div>
				<label>Username</label>
				<input class="main-input" type="text" name="username" v-model="regForm.name"
				v-on="{input: prevalidate, focus: prevalidate, change: prevalidate}">
				<label>Password</label>
				<input class="main-input" type="text" name="password" v-model="regForm.password"
				v-on="{input: prevalidate, focus: prevalidate, change: prevalidate}">
				<button class="main-button" @click.prevent="submitReg">Sign Up</button>
			</form>
		</div>
  </div>
</template>

<script>
export default {
  name: 'auth-page',
  sockets: {
		loginSuccess(authInfo) {
			this.$store.commit('manageLogin', true);
			localStorage.setItem('EnerZoneToken', authInfo.token);
			if (!localStorage.getItem('Nickname')) {
				localStorage.setItem('Nickname', authInfo.nick);
			}
		},
		loginFail(msg) {
			this.loginForm.info = msg;
		},
		registerFail(msg) {
			this.regForm.info = msg;
		}
  },
  data() {
		return {
			loginForm: {
				name: '',
				password: '',
				remember: false,
				show: false,
				info: '',
			},
			regForm: {
				name: '',
				password: '',
				show: false,
				info: '',
			}
		}
  },
  methods: {
  	showLoginForm() {
			this.loginForm.show = true;
  	},
  	showRegForm() {
			this.regForm.show = true;
  	},
  	submitLogin() {
			this.$socket.emit('tryLogin', {
				name: this.loginForm.name,
				password: this.loginForm.password,
				remember: this.loginForm.remember,
			});
  	},
  	submitReg() {
			var result = true;
			this.regForm.info = '';
			if (this.regForm.name.length < 4) {
				result = false;
				this.regForm.info += 'Username must be at least 4 characters long. ';
			}

			if (this.regForm.password.length < 6) {
				result = false;
				this.regForm.info += 'Password must be at least 6 characters long. ';
			}
			if (result) {
				this.$socket.emit('tryRegister', {
					name: this.regForm.name,
					password: this.regForm.password,
				});
			}
  	},
  	prevalidate() {
			this.regForm.name = this.regForm.name.replace(/[\W\s]/, '');
			this.regForm.password = this.regForm.password.replace(/[а-яА-Я\s]/, '');
			this.clearErrors();
  	},
  	clearErrors() {
  		this.loginForm.info = '';
  		this.regForm.info = '';
  	},
  	closeModals() {
  		this.loginForm.show = false;
  		this.regForm.show = false;
  	}
  }
}
</script>
