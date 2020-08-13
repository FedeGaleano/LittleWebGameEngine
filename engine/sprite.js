class Sprite {
  constructor(image, numberOfFrames, framesDurations, graphics, flip = false, flop = false) {
    this.flip = flip;
    this.flop = flop;
    this.image = image;
    this.numberOfFrames = numberOfFrames;
    this.framesDurations = typeof framesDurations === 'number' ? Array(numberOfFrames).fill(framesDurations) : framesDurations;
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

  render(x, y, debug = false) {
    const {
      image, currentFrame, frameWidth, graphics, flip, flop,
    } = this;

    // if (flip || flop) graphics.renderingContext2D.scale(flip ? -1 : 1, flop ? -1 : 1);

    graphics.renderer.renderSubBitmap(
      image, x, y, frameWidth * currentFrame, 0, frameWidth, image.height,
    );
  }
}

export default Sprite;
