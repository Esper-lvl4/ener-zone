import EffectParser from '@/modules/EffectParser.js';
const EffectUser = {
  chain: [],

  resolver(effect) {
    return EffectParser(effect);
  }
}