<template>
	<div @click="openZoneList" :data-zone="zone">
		<div class="visible-zone-card">
			<img class="zone-card" v-if="zone.card"
				:width="zone.card.type.toLowerCase() == 'key' ? 550 : 392"
				:height="zone.card.type.toLowerCase() == 'key' ? 392 : 550"
				:src="zone.card.image"
				:alt="zone.card.name"
				data-number="lrig">
				<img class="zone-card" v-else-if="zone.under.length !== 0"
					:width="under[0].type.toLowerCase() == 'key' ? 550 : 392"
					:height="under[0].type.toLowerCase() == 'key' ? 392 : 550"
					:src="under[0].image"
					:alt="under[0].name"
					data-number="lrig">
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" @click.stop.self.prevent="closeZoneList">
			<div class="zone-content-wrap block-style">
				<img class="zone-card" v-for="(card, index) in under"
					:width="card.type.toLowerCase() == 'key' ? 550 : 392"
					:height="card.type.toLowerCase() == 'key' ? 392 : 550"
					:src="card.image"
					:alt="card.name"
					:data-number="index">
			</div>
		</div>
	</div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
	name: 'signi-zone',
	props: [
		'zone', 'cardback', 'isPublic', 'zoneName', 'zoneIndex'
	],
	data: () => ({
		isOpened: false,
	}),
	computed: {
		topCard() {
			if (this.zone[0]) {
				return this.zone[0];
			}
			return false;
		},
		under() {
			return this.zone.under;
		}
	},
	methods: {
		cardHover(event, deck) {
			if (event.target.tagName !== 'IMG') {
				return;
			}
			this.emit('card-hover', event.target.parentElement.getAttribute('data-number'));
		},
		openZoneList () {
			if (this.zone.length !== 0 && !this.isHidden) {
				this.isOpened = true;
			}
		},
		closeZoneList () {
			this.isOpened = false;
		},
	}
}
</script>
