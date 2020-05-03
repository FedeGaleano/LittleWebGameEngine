class Sprite {
  constructor(image, numberOfFrames, framesDurations, graphics, flip = false, flop = false) {
    this.flip = flip;
    this.flop = flop;
    this.image = image;
    this.numberOfFrames = numberOfFrames;
    this.framesDurations = framesDurations;
    this.graphics = graphics;
    this.frameWidth = image.width / numberOfFrames;
    this.frameHeight = image.height;
    this.currentFrame = 0;
    this.currentFrameDuration = 0;
    this.width = this.frameWidth;
    this.height = this.frameHeight;
  }

  update(elapsedTime) {
    if (this.framesDurations[this.currentFrame] <= this.currentFrameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.numberOfFrames;
      this.currentFrameDuration = 0;
    }

    this.currentFrameDuration += elapsedTime;
  }

  render(x, y) {
    const {
      image, currentFrame, frameWidth, graphics, flip, flop,
    } = this;

    // if (flip || flop) graphics.renderingContext2D.scale(flip ? -1 : 1, flop ? -1 : 1);

    graphics.renderingContext2D.drawImage(
      image,
      // SubRectangle
      frameWidth * currentFrame, 0, frameWidth - 0.05, image.height - 0.05,
      // Destiny Canvas
      x * graphics.scale, y * graphics.scale,
      frameWidth * graphics.scale, image.height * graphics.scale,
    );

    // graphics.renderingContext2D.restore();
  }
}

export default Sprite;
