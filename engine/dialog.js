import WordBubble from './wordBubble.js';
import { GameplayGraphics } from './rendering.js';

class Dialog {
  constructor(bottomLeftCornerX, bottomLeftCornerY, textLines, font, textSpeed, options) {
    this.bottomLeftCornerX = bottomLeftCornerX;
    this.bottomLeftCornerY = bottomLeftCornerY;
    this.x = bottomLeftCornerX;
    this.y = bottomLeftCornerY - 3 - 8 * textLines.length - 5;
    this.font = font;
    this.textLines = textLines;
    const lengths = this.textLines.map(({ length }) => length);
    this.dialogLength = lengths.reduce((a, b) => a + b);

    const kerningSumsSorted = textLines.map(font.measureText).sort((a, b) => b - a);
    const maxKerningSum = kerningSumsSorted[0];

    const lengthsSorted = textLines.map(({ length }) => length).sort((a, b) => b - a);
    const maxLength = lengthsSorted[0];
    const OLDMAX = maxLength * 6 - 1;
    this.wordBubble = new WordBubble(this.x, this.y, maxKerningSum, textLines.length * 8);
    this.textSpeed = textSpeed;
    this.openingSpeed = 0.006;
    this.cursor = 0;
    this.complete = false;
    const accumulatedLengths = [...lengths];
    for (let index = 0; index < accumulatedLengths.length; index++) {
      if (index !== 0) {
        accumulatedLengths[index] += accumulatedLengths[index - 1];
      }
    }
    this.accumulatedLengths = accumulatedLengths;
    this.options = options;

    // binds
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.normalUpdate = this.normalUpdate.bind(this);
    this.openingUpdate = this.openingUpdate.bind(this);
    this.normalRender = this.normalRender.bind(this);
    this.openingRender = this.openingRender.bind(this);
    this.forceCompleteText = this.forceCompleteText.bind(this);
    this.reset = this.reset.bind(this);
    this.setBottomLeftCorner = this.setBottomLeftCorner.bind(this);

    if (options.open) {
      this.opening = 0;
      this.updateBehaviour = this.openingUpdate;
      this.renderBehaviour = this.openingRender;
    } else {
      this.opening = 1;
      this.renderBehaviour = this.normalRender;
      this.updateBehaviour = this.normalUpdate;
    }
  }

  update(elapsedTime) {
    this.updateBehaviour(elapsedTime);
  }

  render(camera) {
    this.renderBehaviour(camera);
  }

  normalUpdate(elapsedTime) {
    if (this.cursor < this.dialogLength) {
      this.cursor += this.textSpeed * elapsedTime;
    }
  }

  openingUpdate(elapsedTime) {
    this.opening = Math.min(this.opening + this.openingSpeed * elapsedTime, 1);
    this.wordBubble.opening = this.opening;
    this.wordBubble.y = this.bottomLeftCornerY - 3 - (8 * this.textLines.length) * this.opening - 5;
    if (this.opening >= 1) {
      this.updateBehaviour = this.normalUpdate;
      this.renderBehaviour = this.normalRender;
    }
  }

  normalRender(camera) {
    const { accumulatedLengths } = this;
    this.wordBubble.render(camera);

    for (let line = 0; line < this.textLines.length; line++) {
      GameplayGraphics.renderer.renderString(
        this.textLines[line].substring(0, Math.floor(this.cursor) - (line === 0 ? 0 : accumulatedLengths[line - 1])),
        this.x + 3 - camera.x, this.y + 3 + line * 8 - camera.y, this.font,
      );
    }
  }

  openingRender(camera) {
    this.wordBubble.render(camera);
  }

  forceCompleteText() {
    this.cursor = this.dialogLength;
  }

  reset() {
    this.cursor = 0;
    if (this.options.open) {
      this.opening = 0;
      this.updateBehaviour = this.openingUpdate;
      this.renderBehaviour = this.openingRender;
    }
  }

  get complete() {
    return this.cursor >= this.dialogLength;
  }

  // eslint-disable-next-line no-empty-function
  // eslint-disable-next-line class-methods-use-this
  set complete(_) { }

  setBottomLeftCorner(x, y) {
    this.x = x;
    this.y = y - 3 - 8 * this.textLines.length - 5;
    this.wordBubble.x = this.x;
    this.wordBubble.y = this.y;
  }
}

export default Dialog;
