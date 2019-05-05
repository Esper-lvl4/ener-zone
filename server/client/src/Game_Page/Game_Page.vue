<template>
	<!-- Game block -->
	<div class="game-wrap wrap-size" v-if="gameActive">
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
			gameActive: false,
			cardHover: {
				image: '/files/img/default-card.jpg',
				name: '',
				props: '',
				class: '',
				cost: '',
				timing: '',
				power: '',
				limitCon: '',
				text: 'Gl hf',
			},
			// Zones status.
			lrigTrashZone: [
				{
					altImages: null,
					boosterSet: "WX-15 Incited Selector",
					class: "Nature Spirit: Bacteria",
					coins: null,
					color: "Black",
					cost: null,
					craft: false,
					effect: " <span style=\"color:#FFF; background: #00A33A; padding:0px 3px; border:2px solid #EEE; border-radius:3px; font-weight:bold; display:inline;\">Action</span> <a href=\"/wiki/Down\" class=\"image image-thumbnail link-internal\" title=\"Down\"><img src=\"https://vignette.wikia.nocookie.net/selector-wixoss/images/f/f9/Down.png/revision/latest?cb=20140814193330\" alt=\"Down\" class=\"\" data-image-key=\"Down.png\" data-image-name=\"Down.png\" width=\"18\" height=\"18\"></a>: Remove 1 [<a href=\"/wiki/Virus\" title=\"Virus\">Virus</a>] on your opponent&apos;s <a href=\"/wiki/Field\" title=\"Field\">field</a>. If you do, <a href=\"/wiki/Draw\" title=\"Draw\" class=\"mw-redirect\">draw</a> 1 card.\n",
					image: "https://vignette.wikia.nocookie.net/selector-wixoss/images/4/47/WX15-117.jpg/revision/latest?cb=20161008002426",
					ksLegal: false,
					level: "1",
					limit: null,
					limitingCondition: "Nanashi",
					link: "http://wixoss.wikia.com/wiki/Acnes,_Natural_Bacteria",
					lrigType: null,
					name: "Acnes, Natural Bacteria",
					number: 1,
					power: "1000",
					ru: false,
					timing: null,
					type: "SIGNI",
				}
			],
			trashZone: [],
			mainDeckZone: [],
			lrigDeckZone: [],
			lrigZone: {
				lrig: {},
				key: {},
				under: [],
			},
			lifeClothZone: [],
			checkZone: [],
			enerZone: [],
			signiZones: [
				{card: {}, under: {}},
				{card: {}, under: {}},
				{card: {}, under: {}},
			],
		}
	}
}
</script>
