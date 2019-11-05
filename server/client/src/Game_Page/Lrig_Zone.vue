<template>
	<div class="block-style" @click="openZoneList" data-zone>
		<div class="visible-zone-card">
			<img class="zone-card" v-if="zone.card"
				width="392"
				height="550"
				:src="zone.card.image"
				:alt="zone.card.name"
				data-number="lrig">
			<img class="zone-card" v-for="(card, index) in filteredKeys" :key="card.id + index"
				width="550"
				height="392"
				:src="card.image"
				:alt="card.name"
				:data-number="index">
			<img class="zone-card" v-if="zone.under.length !== 0 && zone.key.length === 0 && !zone.card"
				:width="under[0].type.toLowerCase() == 'key' ? 550 : 392"
				:height="under[0].type.toLowerCase() == 'key' ? 392 : 550"
				:src="under[0].image"
				:alt="under[0].name"
				data-number="lrig">
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" @click.stop.self.prevent="closeZoneList">
			<div class="zone-content-wrap block-style">
				<img class="zone-card" v-for="(card, index) in under" :key="card.id + index"
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
import cardZone from './Card_Zone.vue';

export default {
	name: 'lrig-zone',
	extends: cardZone,
	props: {
		zone: {
			type: Object,
			default: () => ({}),
		},
	},
	computed: {
		under() {
			return this.zone.under.filter(card => card !== null && card !== undefined);
		},
		filteredKeys() {
			return this.zone.key.filter(card => card !== null && card !== undefined);
		}
	},
}
</script>
