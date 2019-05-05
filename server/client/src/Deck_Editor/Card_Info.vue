<template>
  <div class="info-block block-style" @click.prevent>
    <img class="info-img" :src="card.image" v-if="card.image !== ''" alt="card-image" width="392" height="550">
    <img class="info-img" src="./../assets/img/default-card.jpg" alt="card-image" width="392" height="550" v-else>
		<span><b>{{card.name}}</b></span>
		<span><i>{{card.props}}</i></span>
		<span v-html="card.class"></span>
		<span v-html="card.cost"></span>
		<span v-html="card.timing"></span>
		<span v-html="card.power"></span>
		<span v-html="card.limitCon"></span>
		<div class="info-text" id="effect-wrap" v-html="card.text"></div>
	</div>
</template>
<script>
export default {
  name: "card-info",
  props: {
    cardInfo: {
      default: {},
      type: Object,
    }
  },
  data: () => {
    return {

      // Default card.
      cardInformation: {
        image: '',
        name: 'Guzuko',
        color: 'Black',
        type: 'LRIG',
        lrigType: 'Guzuko',
        limit: '0',
        coins: '3',
        level: '0',
        class: '',
        power: '',
        cost: '',
        craft: false,
        timing: '',
        power: '',
        limitingCondition: '',
        effect: '',
        boosterSet: '',
        altImages: '',
        link: '',
        ksLegal: '',
        ru: '',
      },
      effectWrap: document.getElementById('effect-wrap'),
    }
  },
  computed: {

    // Prop, that returns card object to display in info-block.
  	card() {
      // Use default card if needed.
      let cardInfo = this.cardInfo ? this.cardInfo : this.cardInformation;
  		let info = {
  			image: cardInfo.image,
  			name: cardInfo.name,
  			props: `${cardInfo.type}/${cardInfo.color}`,
  			timing: cardInfo.timing ? `<b>Use Timing</b>: ${cardInfo.timing}` : '',
  			limitCon: cardInfo.limitingCondition ? `<b>Limiting Condition:</b> ${cardInfo.limitingCondition}` : '',
				text: this.replaceImages(cardInfo.effect),
  		};

  		if (cardInfo.type.toLowerCase() == 'lrig') {
  			info.props += `/level ${cardInfo.level}/limit ${cardInfo.limit}`;
  			if (cardInfo.coins != '0') {
  				info.props += `/coins ${cardInfo.coins}`
  			}
        info.cost = `<b>Grow cost:</b> ${cardInfo.cost}`;
        info.class = `<b>Lrig type</b>: ${cardInfo.lrigType}`;
  		} else if (cardInfo.type.toLowerCase() == 'signi' || cardInfo.type.toLowerCase() == 'resona') {
  			info.props += `/level ${cardInfo.level}`;
        info.cost = '';
        info.class = `<b>Class:</b> ${cardInfo.class}`;
        info.power = `<b>Power:</b> ${cardInfo.power}`;
  		} else if (cardInfo.type.toLowerCase() == 'arts' && cardInfo.craft) {
				info.props += `/Craft`;
  		} else if (cardInfo.type.toLowerCase() == 'arts' || cardInfo.type.toLowerCase() == 'spell' || cardInfo.type.toLowerCase() == 'key') {
        info.cost = `<b>Use cost</b>: ${cardInfo.cost}`;
      }

  		return info;
  	},
  },
  methods: {

    // Replace images with server's own ones.
    replaceImages (effect) {
      let text = this.replaceBorders(effect);
      let div = document.createElement('DIV');
      div.innerHTML = text;
      let matched = div.getElementsByTagName('IMG');
      if (matched.length !== 0) {
        for (let image of matched) {
          let altText = image.getAttribute('alt');
          let src = this.getSrc(altText);
          image.setAttribute('src', src);
          image.setAttribute('alt', altText);
          image.setAttribute('width', '22');
          image.setAttribute('height', '22');
          image.removeAttribute('class');
        }
      }
      return div.outerHTML;
    },

    // Replace image's src depending on the alt of an initial image.
    getSrc(alt) {
      let src = '';
      switch (alt) {
        case 'Heaven':
          src = '/src/assets/img/heaven.png';
          break;
        case 'Life Burst':
          src = '/src/assets/img/life-burst.png';
          break;
        case 'RedIcon':
        case 'Red':
          src = '/src/assets/img/red.png';
          break;
        case 'BlueIcon':
        case 'Blue':
          src = '/src/assets/img/blue.png';
          break;
        case 'GreenIcon':
        case 'Green':
          src = '/src/assets/img/green.png';
          break;
        case 'WhiteIcon':
        case 'White':
          src = '/src/assets/img/white.png';
          break;
        case 'BlackIcon':
        case 'Black':
          src = '/src/assets/img/black.png';
          break;
        case 'ColorlessIcon':
        case 'Colorless':
          src: '/src/assets/img/colorless.png';
          break;
        case 'CoinIcon':
        case 'Coin':
          src: '/src/assets/img/coin.png';
          break;
      }
      return src;
    },
    // CHange color of the border from dark to white.
    replaceBorders(text) {
      if (!text) return '';
      return text.replace('border: 1px solid black;', 'border: 1px solid #f1f1f1;');
    }
  },
}
</script>
