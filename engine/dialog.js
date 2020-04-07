import WordBubble from './wordBubble.js';
import { GameplayGraphics } from './rendering.js';
import { resources } from './resources.js';

class Dialog {
  constructor(bottomLeftCornerX, bottomLeftCornerY, textLines, textSpeed) {
    this.x = bottomLeftCornerX;
    this.y = bottomLeftCornerY - 3 - 8 * textLines.length - 5;
    this.textLines = textLines;
    const maxLength = textLines.map(({ length }) => length).sort()[textLines.length - 1];
    this.wordBubble = new WordBubble(this.x, this.y, maxLength * 6, textLines.length * 8);
    this.textSpeed = textSpeed;
    this.count = 0;
  }

  update() {
    this.count++;
  }

  render(camera) {
    this.wordBubble.render(camera);
    const lengths = this.textLines.map(({ length }) => length);
    const accumulatedLengths = [...lengths];
    for (let index = 0; index < accumulatedLengths.length; index++) {
      if (index !== 0) {
        accumulatedLengths[index] += accumulatedLengths[index - 1];
      }
    }

    for (let line = 0; line < this.textLines.length; line++) {
      GameplayGraphics.renderer.renderString(
        this.textLines[line].substring(0, Math.floor(this.count * this.textSpeed) - (line === 0 ? 0 : accumulatedLengths[line - 1])),
        this.x + 3 - camera.x, this.y + 3 + line * 8 - camera.y, resources.font,
      );
    }
  }
}

export default Dialog;
