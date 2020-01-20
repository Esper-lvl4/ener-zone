const trait = {
  hasTrait(options) {
    return true;
  },
  hasColor(options) {
    return this.hasTrait(options);
  },
  hasLrigType(options) {
    return this.hasTrait(options);
  },
  hasSigniType(options) {
    return this.hasTrait(options);
  },
  hasPower(options) {
    return this.hasTrait(options);
  },
};

export default trait;