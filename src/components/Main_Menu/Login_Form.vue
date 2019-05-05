<template>
  <div class="login-wrap">
    <form class="login-form" @submit.prevent="loginSubmit()">
      <div class="info"></div>
      <label>Username</label>
      <input type="text" name="username" v-model="username">
      <label>Password</label>
      <input type="text" name="password" v-model="password">
      <label>Remember me</label>
      <input type="checkbox" name="remember" v-model="remember">
      <button>Log in</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'login-form',
  data() {
    return {
      username: '',
      password: '',
      remember: false,
    }
  },
  methods: {
    loginSubmit(){
      socket.emit('login', {
        name: this.username,
        password: this.password,
        remember: this.remember
      })
    }
  }
}
</script>
