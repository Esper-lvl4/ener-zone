<template>
	<!-- Game block -->
	<div class="game-wrap wrap-size">
		<div class="info-block">
			<img :src="cardHover.image" class="info-img">
			<span>{{cardHover.name}}</span>
			<span>{{cardHover.props}}</span>
			<span>{{cardHover.class}}</span>
			<span>{{cardHover.cost}}</span>
			<span>{{cardHover.timing}}</span>
			<span>{{cardHover.power}}</span>
			<span>{{cardHover.limitCon}}</span>
			<div class="info-text">{{cardHover.text}}</div>
		</div>
		<div class="top-player-field">
			<div class="lrig-trash-zone game-zone">
				<div class="zone-content">
					<img :src="cardHover.image" alt="noname">
				</div>
			</div>
			<div class="lrig-deck-zone game-zone">
				<div class="zone-content">
					<img class="card" src="https://vignette.wikia.nocookie.net/selector-wixoss/images/d/d0/WDK07-Y06.jpg/revision/latest?cb=20180921002552" alt="iona">
				</div>
			</div>
			<div class="life-cloth-zone game-zone">
				<div class="zone-content">
					lifecloth
				</div>
			</div>
			<div class="trash-zone game-zone">
				<div class="zone-content">
					trash
				</div>
			</div>
			<div class="lrig-zone game-zone">
				<div class="zone-content">
					lrig/key
				</div>
			</div>
			<div class="check-zone game-zone">
				<div class="zone-content">
					check zone
				</div>
			</div>
			<div class="main-deck-zone game-zone">
				<div class="zone-content">
					main deck
				</div>
			</div>
			<div class="signi-zones game-zone">
				<div class="zone-content">
					<div class="signi-zone1">Right signi zone</div>
					<div class="signi-zone2">Middle signi zone</div>
					<div class="signi-zone3">Left signi zone</div>
				</div>
			</div>
			<div class="ener-zone game-zone">
				<div class="zone-content">
					Ener-zone
				</div>
			</div>
		</div>
	</div>
	<!-- /Game block -->
</template>

<script>
export default {
  name: 'game',
	data() {
		return {
			// Game props

			
		}
	},
}
</script>
