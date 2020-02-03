import ParserConfig from '@/config/ParserConfig.js';

function EffectParser(string) {
  let effect = string;
  // %onPlay%{payEner(g2)}: do[banish(level: 3-, quantity: 1)]; if[signiCount(player: 'you', count: 2+), signiCount(player: 'enemy', count: 0)] 
  // then[enerCharge(1), draw(1)] else[];
  // %@Auto%: cost[payEner(g2)]; if[cost(false)] then[enerCharge(1), draw(1)] else[];

  // Getting type.
  const firstIndex = effect.indexOf('%');
  const secondIndex = effect.indexOf('%', firstIndex + 1);
  const type = effect.slice(firstIndex, secondIndex);
  effect = effect.slice(0, firstIndex) + effect.slice(secondIndex + 1);

  // Getting effect constructions.
  let constructions = effect.split(';');

  // Creating effect object.
  const effectObject = {
    type,
    hasFakeType: true,
    costResult: [],
    execute(card) {
      if (!this.functions) return;
      for (let func of this.functions) {
        func(card);
      }
      this.costResult = [];
    },
  };

  // Parcing each construction.
  effectObject.functions = constructions.map(construct => parseConstruction(construct));

  return effectObject;
}

function parseConstruction(string) {
  const construct = string.replace('/\s/g', '');
  const type = construct.slice(0, construct.indexOf('['));
  return ParserConfig.parse(type, construct);
}

export default EffectParser;