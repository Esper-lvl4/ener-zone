<template>
  <div class="menu-wrap">
    <a class="main-button hvr-shutter-in-horizontal" id="play" href="/lobby/">Play</a>
    <a class="main-button hvr-shutter-in-horizontal" id="deck-editor" href="/deck-editor/">Deck Editor</a>
    <a class="main-button hvr-shutter-in-horizontal" id="options" href="#">Options</a>
    <a class="main-button hvr-shutter-in-horizontal" id="profile" href="#">Profile</a>
    <a class="main-button hvr-shutter-in-horizontal" id="language" href="#">Language</a>
    <a class="main-button hvr-shutter-in-horizontal" id="parse" href="/parse-db/">Parser</a>
    <a class="main-button hvr-shutter-in-horizontal" id="logout" href="#">Logout</a>
  </div>
</template>

<script>
export default {
  name: 'main-menu',
  props: {
    msg: String
  }
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
