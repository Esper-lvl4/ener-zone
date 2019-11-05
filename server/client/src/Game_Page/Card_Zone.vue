<template>
	<div class="block-style" @click="openZoneList" data-zone>
		<div class="visible-zone-card">
			<draggable :list="zoneVisible">
				<img class="zone-card" v-if="(!isPublic || isHidden) && zone.length !== 0" 
					:src="cardBackImage" alt="card-back" width="250" height="349"
				>
				<img class="zone-card" v-else-if="topCard && zone.length !== 0"
					width="392"
					height="550"
					:src="topCard.image"
					:alt="topCard.name"
					:data-number="0">
			</draggable>
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" 
			@click.stop.self.prevent="closeZoneList"
		>
			<div class="zone-content-wrap block-style">
				<draggable :list="zoneContent">
					<img class="zone-card" v-for="(card, index) in filteredZone" 
						:key="card.id + index"
						:width="card.type.toLowerCase() == 'key' ? 550 : 392"
						:height="card.type.toLowerCase() == 'key' ? 392 : 550"
						:src="card.image"
						:alt="card.name"
						:data-number="index">
				</draggable>
			</div>
		</div>
	</div>
</template>

<script>
import draggable from 'vuedraggable';

export default {
	name: 'card-zone',
	props: {
		zone: {
			type: Array,
			default: () => ([]),
		},
		cardback: {
			type: String,
			default: 'main',
		},
		isPublic: {
			type: Boolean,
			default: false,
		},
		isHidden: {
			type: Boolean,
			default: false,
		},
	},
	data: () => ({
		isOpened: false,
		zoneContent: [],
		zoneVisible: [],
	}),
	computed: {
		topCard() {
			if (this.zone[0]) {
				return this.zone[0];
			}
			return false;
		},
		filteredZone() {
			return this.zone.filter(card => card !== null && card !== undefined);
		},
		cardBackImage() {
			if (this.cardback === 'main') {
				return '/src/assets/img/card-back.jpg';
			} else if (this.cardback === 'lrig') {
				return '/src/assets/img/card-back-lrig-deck.jpg';
			}
		},
	},
	methods: {
		cardHover(event, deck) {
			const target = event.target;
			if (target.tagName !== 'IMG') {
				return;
			}
			this.emit('card-hover', target.parentElement.getAttribute('data-number'));
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
