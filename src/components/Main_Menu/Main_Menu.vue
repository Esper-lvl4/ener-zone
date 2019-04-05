<template>
  <div class="global-main">
    <div class="menu-wrap" :class="{'hide-menu': isMainMenu}">
      <button 
        v-for="(link, index) in menuComponents" :key="index"
        class="main-button hvr-shutter-in-horizontal" 
        @click.prevent="menuClickHandler(index)">
          {{link.eng}}
      </button>
    </div>

    <login-form v-if="loginModal"/>
  </div>
</template>

<script>
import LoginForm from './Login_Form.vue';

export default {
  name: 'main-menu',
  components: {
    LoginForm,
  },
  props: [
    'lang'
  ],
  data(){
    return {
      menuComponents: {
        lobbyPage: {eng: 'Play', ru: 'Играть', page: 'lobby-page', isActive: false},
        deckEditor: {eng: 'Deck Editor', ru: 'Редактор колод', page: 'deck-editor', isActive: false},
        options: {eng: 'Options', ru: 'Настройки', modal: 'options', isActive: false},
        profile: {eng: 'Profile', ru: 'Профиль', modal: 'profile', isActive: false},
        language: {eng: 'Language', ru: 'Язык', modal: 'language', isActive: false},
        admin: {eng: 'Parser', ru: 'Парсер', page: 'parser-page', isActive: false},
        logout: {eng: 'Logout', ru: 'Выйти'},
      },
      loginModal: false,
    }
  },
  computed: {
    isMainMenu(){
      let result = true;
      for (let i = 0; i < this.menuComponents.length; i++) {
        if (this.menuComponents[i].isActive) {
          result = false;
          break;
        }
      }
      return result;
    }
  },
  methods: {
    menuClickHandler(j){
      this.menuComponents.forEach((item) => {
        item.isActive = false;
      })
      this.menuComponents[j].isActive = true;
    }
  },
}
</script>

<style>
.menu-wrap {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  width: 700px;
  height: 400px;
  margin: 0 auto;
}
.menu-wrap .main-button {
  width: 50%;
  color: #000000;
}

.login-wrap, .sign-up-wrap {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 1;
  transition: all 1s ease;
}

.login-wrap .login-form, .sign-up-wrap .sign-up-form {
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  align-content: center;
  width: 400px;
  padding: 100px 50px;
  background: #000000;
  color: #ffffff;
}
.info {
  padding: 5px;
  text-align: center;
  color: #ff3333;
}
.error {
  border: 2px solid #ff3333;
}
</style>
