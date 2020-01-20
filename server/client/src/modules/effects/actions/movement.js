const movement = {
  moveCard(options) {
    
  },
  banish(options) {
    this.moveCard(options);
  },
  trash(options) {
    this.moveCard(options);
  },
  toEnerZone(options) {
    this.moveCard(options);
  },
  bounce(options) {
    this.moveCard(options);
  },
  returnToDeck(options) {
    this.moveCard(options);
  },
}

export default movement;