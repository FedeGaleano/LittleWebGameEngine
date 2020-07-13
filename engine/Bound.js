class Bound {
  static clear(bound) {
    bound.x = null;
    bound.y = null;
    bound.width = null;
    bound.height = null;
  }

  constructor() {
    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
  }

  copyDataTo(destinyBound) {
    destinyBound.x = this.x;
    destinyBound.y = this.y;
    destinyBound.width = this.width;
    destinyBound.height = this.height;
  }
}

export default Bound;
