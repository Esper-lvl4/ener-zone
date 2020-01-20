const temporal = {
  hasTemporalTrait(options) {
    return true;
  },
  hasBanishImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasTrashImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasBounceImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasSigniImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasLrigImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasArtsImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasSpellImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasKeyImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasTargetImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasOpponentImmunity(options) {
    return this.hasTemporalTrait(options);
  },
  hasEffects(options) {
    return this.hasTemporalTrait(options);
  }
};

export default temporal;