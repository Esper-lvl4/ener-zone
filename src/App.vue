<template>
  <div id="app">
    <div class="global-wrap">
      <div class="global-size">
        <div class="global-header">
          <h1 class="main-title">{{version}}</h1>
        </div>
        <div class="global-main">
          <main-menu v-if="pages['main-menu']" @change-page="changePage"/>
        </div>
      </div>
    </div>
    <div class="global-footer">
      <div class="global-size">
        <span>Open!</span>
      </div>
    </div>

    <!-- Login popup -->

    <div class="login-wrap js-none js-dissolve" id="login-wrap">
      <form class="login-form" id="login-form">
        <div class="info"></div>
        <label>Username</label>
        <input type="text" name="username" id="login-username">
        <label>Password</label>
        <input type="text" name="password" id="login-password">
        <label>Remember me</label>
        <input type="checkbox" name="remember" id="login-remember">
        <button id="login-submit">Log in</button>
      </form>
    </div>

    <!-- Sign Up popup -->

    <div class="sign-up-wrap js-none js-dissolve" id="sign-up-wrap">
      <form class="sign-up-form" id="sign-up-form">
        <div class="info"></div>
        <label>Username</label>
        <input type="text" name="username" id="sign-up-username">
        <label>Password</label>
        <input type="text" name="password" id="sign-up-password">
        <button id="sign-up-submit">Sign Up</button>
      </form>
    </div>
  </div>
</template>

<script>
import './assets/css/global.css';
import './assets/css/hover.css';
import './assets/css/normalize.css';

import MainMenu from './components/Main_Menu/Main_Menu.vue';

export default {
  name: 'app',
  components: {
    MainMenu
  },
  data(){
    return {
      version: 'Wixoss Client v.0.0.45',
      pages: {
        'main-menu': true,
        'lobby-page': false,
        'deck-editor': false,
        'parser-page': false,
      }
    }
  },
  methods: {
    changePage(page){
      for (let i in this.pages) {
        this.pages[i] = false;
      }
      this.pages[page] = true;
    }
  },
}
</script>

<style>

</style>
