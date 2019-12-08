<template>
	<div :class="zoneName" @click="openZoneList" :data-zone="zone">
		<div class="visible-zone-card">
				<Card class="zone-card" v-if="zone.card" :card="zone.card" />
				<Card class="zone-card" v-else-if="!isEmpty" :card="under[0]" />
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" 
			@click.stop.self.prevent="closeZoneList"
		>
			<div class="zone-content-wrap block-style">
				<Card class="zone-card" v-for="(card, index) in under" :key="zoneName + '-' + index"
					:card="card" />
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
		under() {
			return this.zone.under.filter(card => card !== null && card !== undefined);
		},
		isEmpty() {
			return this.zone.under.length === 0 && !this.zone.card;
		},
	},
}
</script>
