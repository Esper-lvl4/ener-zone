<template>
	<div :class="'block-style' + ' ' + zoneName" @click="openZoneList" data-zone>
		<div class="visible-zone-card">
			<Card class="zone-card" v-if="zone.card" :card="zone.card" />
			<Card class="zone-card" v-for="(card, index) in filteredKeys" :key="card.id + index"
				:card="card" />
		</div>
		<div class="zone-content" :class="{'is-opened': isOpened}" @click.stop.self.prevent="closeZoneList">
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
		},
		isEmpty() {
			return this.zone.under.length === 0 && !this.zone.card && !this.zone.key;
		},
	},
}
</script>
