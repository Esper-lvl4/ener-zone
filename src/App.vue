<template>
  <div id="app">
    <div class="global-wrap">
      <div class="global-size">
        <div class="global-header">
          <h1 class="main-title">{{version}}</h1>
        </div>
        <main-menu/>
      </div>
    </div>
    <div class="global-footer">
      <div class="global-size">
        <span>Open!</span>
      </div>
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
    }
  },
}
</script>

<style>

</style>
