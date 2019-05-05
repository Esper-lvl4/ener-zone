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
    applyFilter() {
      let result = [];
      let database = this.database;
      let filter = {};
      if (this.color) {
        filter.checkColor = function (card) {
          if (card.color === null) {
						return false;
					}
					if (card.color.toLowerCase().match(this.color.toLowerCase()) !== null) {
						return true;
					}
        }.bind(this);
      }
      if (this.type) {
        filter.checkType = function (card) {
          if (card.type === null) {
						return false;
					}
					if (card.type.match(this.type)) {
						return true;
					}
        }.bind(this);
      }
      if (this.signiClass) {
        filter.checkSigniClass = function (card) {
          if (card.class === null) {
						return false;
					}
					if (card.class.toLowerCase().match(this.class.toLowerCase()) !== null) {
						return true;
					}
        }.bind(this);
      }
      if (this.lrigType) {
        filter.checkLrigType = function (card) {
          if (card.lrigType === null) {
						return false;
					}
					if (card.lrigType.toLowerCase().match(this.lrigType.toLowerCase()) !== null) {
						return true;
					}
        }.bind(this);
      }
      if (this.level) {
        filter.checkLevel = function (card) {
          if (card.level === null) {
						return false;
					}
					if (+card.level == +this.level) {
						return true;
					}
        }.bind(this);
      }
      if (this.limit) {
        filter.checkLimit = function (card) {
          if (card.limit === null) {
						return false;
					}
					if (+card.limit == +this.limit) {
						return true;
					}
        }.bind(this);
      }
      if (this.power) {
        filter.checkPower = function (card) {
          if (card.power === null) {
						return false;
					}
					if (+card.power == +this.power) {
						return true;
					}
        }.bind(this);
      }
      if (this.timing) {
        filter.checkTiming = function (card) {
          if (card.timing === null) {
						return false;
					}
					if (card.timing.toLowerCase().match(this.timing.toLowerCase()) !== null) {
						return true;
					}
        }.bind(this);
      }
      if (this.limitingCondition) {
        filter.checkLimitingCondition = function (card) {
          if (card.limitingCondition === null) {
						return false;
					}
					if (card.limitingCondition.toLowerCase().match(this.limitingCondition.toLowerCase()) !== null) {
						return true;
					}
        }.bind(this);
      }
      if (this.effect) {
        filter.checkEffect = function (card) {
          if (card.effect === null) {
						return false;
					}
					if (card.effect.toLowerCase().match(this.effect.toLowerCase()) !== null) {
						return true;
					}
        }.bind(this);
      }
      if (this.boosterSet) {
        filter.checkBoosterSet = function (card) {
          if (card.boosterSet === null) {
						return false;
					}
          if (card.boosterSet.toLowerCase().match(this.boosterSet.toLowerCase()) !== null) {
						return true;
					}
        }.bind(this);
      }
      if (this.ksLegal) {
        filter.checkKsLegal = function (card) {
          if (card.ksLegal === this.ksLegal) {
						return true;
					} else {
            return false;
          }
        }.bind(this);
      }

      // Use all filters, that are specified.
      for (let i = 0; i < database.length; i++) {
        let next = false;
        for (let j in filter) {
          if (!filter[j](database[i])) {
            next = true;
            break;
          }
        }
        if (next) {
          continue;
        }
        result.push(database[i]);
      }

      this.$store.commit('filterDatabase', result);
    },
  },
}
</script>
