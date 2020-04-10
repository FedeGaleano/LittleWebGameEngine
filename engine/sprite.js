class Sprite {
  constructor(image, numberOfFrames, frameRepetitions, graphics) {
    this.image = image;
    this.numberOfFrames = numberOfFrames;
    this.frameRepetitions = frameRepetitions;
    this.graphics = graphics;
    this.frameWidth = image.width / numberOfFrames;
    this.frameHeight = image.height;
    this.currentFrame = 0;
    this.currentFrameRepetitions = 0;
    this.width = this.frameWidth;
    this.height = this.frameHeight;
  }

  update() {
    if (this.frameRepetitions[this.currentFrame] <= this.currentFrameRepetitions) {
      this.currentFrame = (this.currentFrame + 1) % this.numberOfFrames;
      this.currentFrameRepetitions = 0;
    }
  }

  render(x, y) {
    const {
      image, currentFrame, frameWidth, graphics,
    } = this;
    // const asd = ;
    // console.log(`frameWidth ${frameWidth}`);
    graphics.renderingContext2D.drawImage(
      image,
      // SubRectangle
      frameWidth * currentFrame, 0, frameWidth - 0.05, image.height - 0.05,
      // Destiny Canvas
      x * graphics.scale, y * graphics.scale,
      frameWidth * graphics.scale, image.height * graphics.scale,
    );
    // graphics.renderingContext2D.strokeRect(
    //   x * graphics.scale, y * graphics.scale,
    //   frameWidth * graphics.scale, image.height * graphics.scale,
    // );
    this.currentFrameRepetitions++;
  }
}

export default Sprite;
