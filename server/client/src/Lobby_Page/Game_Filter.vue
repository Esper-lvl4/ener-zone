<template>
	<form class="filter-modal-wrap" autocomplete="off">
		<input type="number" name="people-count">
		<input type="text" name="spectators-allowed">
		<input type="text" name="username">
		<input type="checkbox" name="hide-password-protected">
	</form>
</template>
<script>
export default {
  name: "game-filter",
  data: () => ({

  })
}
</script>
