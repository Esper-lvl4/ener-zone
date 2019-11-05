<template>
	<div @click="openZoneList" :data-zone="zone">
		<div class="visible-zone-card">
			<img class="zone-card" v-if="zone.card"
				:width="zone.card.type.toLowerCase() == 'key' ? 550 : 392"
				:height="zone.card.type.toLowerCase() == 'key' ? 392 : 550"
				:src="zone.card.image"
				:alt="zone.card.name"
				data-number="lrig">
				<img class="zone-card" v-else-if="under.length !== 0"
					:width="under[0].type.toLowerCase() == 'key' ? 550 : 392"
					:height="under[0].type.toLowerCase() == 'key' ? 392 : 550"
					:src="under[0].image"
					:alt="under[0].name"
					data-number="lrig">
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" 
			@click.stop.self.prevent="closeZoneList"
		>
			<div class="zone-content-wrap block-style">
				<img class="zone-card" v-for="(card, index) in under" 
					:key="card.id + index"
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
	name: 'signi-zone',
	extends: cardZone,
	props: {
		zone: {
			type: Object,
			default: () => ({}),
		},
		zoneIndex: {
			type: 'String',
			default: '',
		},
	},
	computed: {
		under() {
			return this.zone.under.filter(card => card !== null && card !== undefined);
		}
	},
}
</script>
