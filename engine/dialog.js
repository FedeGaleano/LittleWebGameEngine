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
    const lengthsSorted = textLines.map(({ length }) => length).sort((a, b) => b - a);
    const maxLength = lengthsSorted[0];
    this.wordBubble = new WordBubble(this.x, this.y, maxLength * 6 - 1, textLines.length * 8);
    this.textSpeed = textSpeed;
    this.count = 0;
    const accumulatedLengths = [...lengths];
    for (let index = 0; index < accumulatedLengths.length; index++) {
      if (index !== 0) {
        accumulatedLengths[index] += accumulatedLengths[index - 1];
      }
    }
    this.accumulatedLengths = accumulatedLengths;
  }

  update() {
    this.count++;
  }

  render(camera) {
    const { accumulatedLengths } = this;
    this.wordBubble.render(camera);

    for (let line = 0; line < this.textLines.length; line++) {
      GameplayGraphics.renderer.renderString(
        this.textLines[line].substring(0, Math.floor(this.count * this.textSpeed) - (line === 0 ? 0 : accumulatedLengths[line - 1])),
        this.x + 3 - camera.x, this.y + 3 + line * 8 - camera.y, resources.font,
      );
    }
  }
}

export default Dialog;
