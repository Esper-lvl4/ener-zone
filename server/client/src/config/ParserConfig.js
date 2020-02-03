import Actions from '@/modules/effects/actions.js';
import Conditions from '@/modules/conditions/conditions.js';

export default {
  // Format: 
  // constructType: 'parserFunction'.
  cost: 'cost',
  if: 'condition',
  do: 'listOfActions',
  
  parsers: {
    // funcName(constructString);
    cost(string) {
      const effects = parseActions(string);
      return function (card) {
        for (let eff in effects) {
          Actions[eff.action]({card, ...eff.args});
        }
      };
    },
    condition(string) {
      let condArr = string.split(']');
      const conditions = parseActions(condArr[0].slice(3));
      const conditionTrueActions = parseActions(condArr[1].slice(5));
      const conditionFalseActions = condArr.length === 4 ? parseActions(condArr[2].slice(5)) : null;
      return function (card) {
        let conditionResult = true;
        for (let cond of conditions) {
          conditionResult = conditionResult && Conditions[cond.action]({card, ...cond.args});
        }
        if (conditionResult) {
          for (let act of conditionTrueActions) {
            Actions[act.action]({card, ...act.args});
          }
        } else if (conditionFalseActions !== null) {
          for (let act of conditionTrueActions) {
            Actions[act.action]({card, ...act.args});
          }
        }
      };
    },
    listOfActions(string) {
      const effects = parseActions(string);
      return function (card) {
        for (let eff in effects) {
          Actions[eff.action]({card, ...eff.args});
        }
      };
    },
  },

  parse(type, construct) {
    return this.parsers[ParserConfig[type]](construct);
  }
};

function parseActions(string) {
  const newStr = string.replace(/[\s\[\]]/g, '');
  return newStr.split('),')
    .map(action => {
      const argsArr = action.slice(action.indexOf('(') + 1).replace(/[\(\)]/g, '').split(',');
      const args = {};
      for (let arg of argsArr) {
        args[arg.replace(/:.+/, '')] = arg.replace(/.+:/, '');
      }
      return {
        action: action.slice(0, action.indexOf('(')),
        args,
      };
    });
}