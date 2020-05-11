class TouchScreenArea {
  constructor(upperLeftCornerX, upperLeftCornerY, width, height, graphics, name) {
    this.upperLeftCornerX = upperLeftCornerX;
    this.upperLeftCornerY = upperLeftCornerY;
    this.width = width;
    this.height = height;
    this.graphics = graphics;
    this.name = name;
  }

  covers(absoluteX, absoluteY) {
    const x = absoluteX / this.graphics.scale;
    const y = absoluteY / this.graphics.scale;

    return x > this.upperLeftCornerX
      && x < this.upperLeftCornerX + this.width
      && y > this.upperLeftCornerY
      && y < this.upperLeftCornerY + this.height;
  }
}

export default TouchScreenArea;
