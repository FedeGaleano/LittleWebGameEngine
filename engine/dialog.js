import WordBubble from './wordBubble.js';
import { GameplayGraphics } from './rendering.js';
import { resources } from './resources.js';

class Dialog {
  constructor(bottomLeftCornerX, bottomLeftCornerY, textLines, textSpeed) {
    this.bottomLeftCornerX = bottomLeftCornerX;
    this.bottomLeftCornerY = bottomLeftCornerY;
    this.x = bottomLeftCornerX;
    this.y = bottomLeftCornerY - 3 - 8 * textLines.length - 5;
    this.textLines = textLines;
    const lengths = this.textLines.map(({ length }) => length);
    this.dialogLength = lengths.reduce((a, b) => a + b);
    const lengthsSorted = textLines.map(({ length }) => length).sort((a, b) => b - a);
    const maxLength = lengthsSorted[0];
    this.wordBubble = new WordBubble(this.x, this.y, maxLength * 6 - 1, textLines.length * 8);
    this.textSpeed = textSpeed;
    this.count = 0;
    this.cursor = 0;
    this.complete = false;
    const accumulatedLengths = [...lengths];
    for (let index = 0; index < accumulatedLengths.length; index++) {
      if (index !== 0) {
        accumulatedLengths[index] += accumulatedLengths[index - 1];
      }
    }
    this.accumulatedLengths = accumulatedLengths;
  }

  update() {
    if (this.cursor < this.dialogLength) {
      this.count++;
      this.cursor = Math.floor(this.count * this.textSpeed);
    }
  }

  render(camera) {
    const { accumulatedLengths } = this;
    this.wordBubble.render(camera);

    for (let line = 0; line < this.textLines.length; line++) {
      GameplayGraphics.renderer.renderString(
        this.textLines[line].substring(0, this.cursor - (line === 0 ? 0 : accumulatedLengths[line - 1])),
        this.x + 3 - camera.x, this.y + 3 + line * 8 - camera.y, resources.font,
      );
    }
  }

  forceCompleteText() {
    this.cursor = this.dialogLength;
  }

  reset() {
    this.count = 0;
    this.cursor = 0;
  }

  get complete() {
    return this.cursor >= this.dialogLength;
  }

  // eslint-disable-next-line no-empty-function
  // eslint-disable-next-line class-methods-use-this
  set complete(_) { }
}

export default Dialog;
