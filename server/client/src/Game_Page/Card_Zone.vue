<template>
	<div :class="'block-style' + ' ' + zoneName" @click="openZoneList" data-zone>
		<div class="visible-zone-card">
			<Card class="zone-card" v-if="(!isPublic || isHidden) && !isEmpty" 
				:card="facedownCard" alt="card-back" />
			<Card class="zone-card" v-if="topCard && !isEmpty" :card="topCard" />
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" 
			@click.stop.self.prevent="closeZoneList">
			<div class="zone-content-wrap block-style">
				<Card class="zone-card" v-for="(card, index) in zoneContent"
					:key="zoneName + '-' + index" :card="card" />
			</div>
		</div>
	</div>
</template>

<script>
import Card from './Card.vue';

export default {
	name: 'card-zone',
	components: {
		Card,
	},
	props: {
		zone: {
			type: Array,
			default: () => ([]),
		},
		zoneName: {
			type: String,
			default: '',
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
		dragOptions() {
			return {
				animation: 300,
				group: "cards",
			}
		},
		topCard() {
			if (this.zone[0]) {
				return this.zone[0];
			}
			return false;
		},
		facedownCard() {
			return {
				type: 'facedown',
				name: '',
				image: this.cardBackImage,
			}
		},
		cardBackImage() {
			if (this.cardback === 'main') {
				return '/src/assets/img/card-back.jpg';
			} else if (this.cardback === 'lrig') {
				return '/src/assets/img/card-back-lrig-deck.jpg';
			}
		},
		isEmpty() {
			return this.zone.length === 0;
		},
	},
	watch: {
		zone(value) {
			console.log('zone: ', value);
			this.zoneContent = this.filterZone(value);
		}
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
		filterZone(zone) {
			return zone.filter(card => card !== null && card !== undefined);
		},
	}
}
</script>
