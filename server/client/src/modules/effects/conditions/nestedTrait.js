const nested = {
  hasNestedTrait(options) {
    return true;
  },
  hasCharm(options) {
    return hasNestedTrait(options);
  },
  hasVirus(options) {
    return hasNestedTrait(options);
  },
  isTrap(options) {
    return this.hasNestedTrait(options);
  },
  hasAccessory(options) {
    return this.hasNestedTrait(options);
  },
};

export default nested;