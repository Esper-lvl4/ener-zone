<template>
  <div class="filter-block block-style-thick">
    <form>
      <div class="filter-first">
        <label>Game format: KS</label>
        <input type="checkbox" name="kslegal" v-model="ksLegal">

        <label>Color</label>
        <input class="main-input" type="text" name="color" v-model="color">

        <label>Card Type</label>
        <select class="main-input" v-model="type">
          <option :value="''"></option>
          <option>LRIG</option>
          <option>ARTS</option>
          <option>Key</option>
          <option>SIGNI</option>
          <option>Spell</option>
          <option>Resona</option>
        </select>

        <label>Text</label>
        <input class="main-input" type="text" name="effect" v-model="effect">

        <label>Booster Set</label>
        <input class="main-input" type="text" name="set" v-model="boosterSet">
      </div>

      <!-- Optional -->

      <div class="filter-second">
        <label>Limiting Condition</label>
        <input class="main-input" type="text" name="limcon" v-model="limitingCondition"
          :disabled="type.toLowerCase() == 'lrig'">

        <label>Signi class</label>
        <input class="main-input" type="text" name="class" v-model="signiClass"
          :disabled="type.toLowerCase() !== 'signi' || type.toLowerCase() !== 'resona'">
        <div class="filter-small-inputs">
          <div>
            <label>Level</label>
            <input class="main-input" type="number" name="level" v-model="level"
              :disabled="type.toLowerCase() == 'arts' || type.toLowerCase() == 'spell' || type.toLowerCase() == 'key'">
          </div>

          <div>
            <label>Limit</label>
            <input class="main-input" type="number" name="limit" v-model="limit"
              :disabled="type.toLowerCase() !== 'lrig'">
          </div>

          <div>
            <label>Power</label>
            <input class="main-input" type="number" name="power" v-model="power"
              :disabled="type.toLowerCase() !== 'signi' || type.toLowerCase() !== 'resona'">
          </div>
        </div>

        <label>Lrig type</label>
        <input class="main-input" type="text" name="lrigtype" v-model="lrigType"
          :disabled="type.toLowerCase() !== 'lrig'">

        <label>Use timing</label>
        <input class="main-input" type="text" name="timing" v-model="timing"
          :disabled="type.toLowerCase() !== 'arts'">
      </div>

      <div class="filter-submit">
        <button class="main-button" name="filter-send" @click.prevent="applyFilter">Search cards</button>
      </div>
    </form>
  </div>
</template>
<script>
export default {
  name: "detailed-filter",
  data: () => ({

    // Filter values.
    color: null,
    type: '',
    signiClass: null,
    lrigType: null,
    level: null,
    limit: null,
    power: null,
    timing: null,
    limitingCondition: null,
    effect: null,
    boosterSet: null,
    ksLegal: null,
  }),
  computed: {
    database() {
      return this.$store.state.database;
    },
  },
  methods: {
    cloneObject(obj) {
    	var clone = {};
    	for (var i in obj) {
    		if (obj[i] != null && typeof(obj[i]) == 'object' && obj[i].forEach) {
    			clone[i] = this.cloneArray(obj[i]);
    		} else if (obj[i] != null && typeof(obj[i]) == 'object') {
    			clone[i] = this.cloneObject(obj[i]);
    		} else {
    			clone[i] = obj[i];
    		}
    	}
    	return clone;
    },
    cloneArray(arr) {
    	var clone = [];
    	for (var a in arr) {
    		if (arr[a] != null && typeof(arr[a]) == 'object' && arr[a].forEach) {
    			clone.push(this.cloneArray(arr[a]));
    		} else if (arr[a] != null && typeof(arr[a]) == 'object') {
    			clone.push(this.cloneObject(arr[a]));
    		} else {
    			clone.push(arr[a]);
    		}
    	}
    	return clone;
    },
    checkColor(card) {
      return card.color && card.color.toLowerCase().match(this.color.toLowerCase());
    },
    checkType(card) {
      return card.type && card.type.match(this.type);
    },
    checkSigniClass(card) {
      return card.class && card.class.toLowerCase().match(this.class.toLowerCase());
    },
    checkLrigType(card) {
      return card.lrigType && card.lrigType.toLowerCase().match(this.lrigType.toLowerCase());
    },
    checkLevel(card) {
      return card.level !== null && +card.level === +this.level;
    },
    checkLimit(card) {
      return card.limit !== null && +card.limit === +this.limit;
    },
    checkPower(card) {
      return card.power !== null && +card.power === +this.power;
    },
    checkTiming(card) {
      return card.timing && card.timing.toLowerCase().match(this.timing.toLowerCase());
    },
    checkLimitingCondition(card) {
      return card.limitingCondition && 
      card.limitingCondition.toLowerCase().match(this.limitingCondition.toLowerCase());
    },
    checkEffect(card) {
      return card.effect && card.effect.toLowerCase().match(this.effect.toLowerCase());
    },
    checkBoosterSet(card) {
      return card.boosterSet && card.boosterSet.toLowerCase().match(this.boosterSet.toLowerCase());
    },
    checkKsLegal(card) {
      return card.ksLegal === this.ksLegal;
    },
    applyFilter() {
      let filter = [];

      if (this.color) {
        filter.push(this.checkColor);
      }
      if (this.type) {
        filter.push(this.checkType);
      }
      if (this.signiClass) {
        filter.push(this.checkSigniClass);
      }
      if (this.lrigType) {
        filter.push(this.checkLrigType);
      }
      if (this.level) {
        filter.push(this.checkLevel);
      }
      if (this.limit) {
        filter.push(this.checkLimit);
      }
      if (this.power) {
        filter.push(this.checkPower);
      }
      if (this.timing) {
        filter.push(this.checkTiming);
      }
      if (this.limitingCondition) {
        filter.push(this.checkLimitingCondition);
      }
      if (this.effect) {
        filter.push(this.checkEffect);
      }
      if (this.boosterSet) {
        filter.push(this.checkBoosterSet);
      }
      if (this.ksLegal) {
        filter.push(this.checkKsLegal);
      }
      
      let database = this.database;

      let result = database.filter(card => {
        return !filter.find(criteria => !criteria(card));
      });

      this.$store.commit('filterDatabase', result);
    },
  },
}
</script>
