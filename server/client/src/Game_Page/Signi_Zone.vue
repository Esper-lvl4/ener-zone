<template>
	<div :class="zoneName + ' droppable'" @click="openZoneList" :data-zone-name="zoneName" :data-zone="zone">
		<div class="visible-zone-card">
				<Card class="zone-card" v-if="zone.card" :card="zone.card" 
					:zone="zoneName"
				/>
				<Card class="zone-card" v-else-if="!isEmpty" :card="zoneContent[0]" 
					:zone="`${zoneName}:under`" :index="0"
				/>
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" 
			@click.stop.self.prevent="closeZoneList"
		>
			<div class="zone-content-wrap block-style droppable">
				<Card class="zone-card" v-for="(card, index) in zoneContent" :key="zoneName + '-' + index"
					:card="card" :zone="`${zoneName}:under`" :index="index"
				/>
			</div>
		</div>
	</div>
</template>

<script>
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
			type: String,
			default: '',
		},
	},
	computed: {
		isEmpty() {
			return this.zone.under.length === 0 && !this.zone.card;
		},
	},
	methods: {
		filterZone() {
			return this.zone.under.filter(card => card !== null && card !== undefined);
		},
	},
}
</script>
