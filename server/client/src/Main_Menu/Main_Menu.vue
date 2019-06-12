<template>
  <div class="menu-wrap" id="main-menu" :class="{'hidden': !visible, 'invisible': gameOn}">
    <button class="menu-arrow" @click="toggleMenu"></button>
    <router-link class="main-button menu-icon sword-icon" to="/lobby" tag="button">Play</router-link>
    <router-link class="main-button menu-icon cards-icon" to="/deck-editor" tag="button">Deck&nbsp;Editor</router-link>
    <router-link class="main-button menu-icon cog-icon" to="/options" tag="button">Options</router-link>
    <router-link class="main-button menu-icon profile-icon" to="/profile" tag="button">Profile</router-link>
    <button class="main-button menu-icon language-icon">Language</button>
    <router-link class="main-button menu-icon parser-icon" to="/admin" tag="button">Parser</router-link>
    <button class="main-button menu-icon exit-icon" @click="logoutHandler">Logout</button>
  </div>
</template>

<script>
export default {
  name: 'main-menu',
  data() {
    return {
      visible: false,
      gameOn: false
    }
  },
  methods: {
    logoutHandler() {
      localStorage.removeItem('EnerZoneToken');
			localStorage.removeItem('Nickname');
      this.$store.commit('manageLogin', false);
    },
    toggleMenu() {
      this.visible = !this.visible;
    }
  }
}
</script>
