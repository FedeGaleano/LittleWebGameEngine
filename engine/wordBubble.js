import { GameplayGraphics } from './rendering.js';
import { resources } from './resources.js';


class WordBubble {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  render(camera) {
    const point = { x: this.x - camera.x, y: this.y - camera.y };

    // Top Left Corner
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x, point.y, 0, 0, 3, 3);
    // Top Right Corner
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x + 3 + this.width, point.y, 3, 0, 3, 3);
    // Bottom Left Corner
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x, point.y + 3 + this.height, 3 * 9, 0, 3, 6);
    // Bottom Right Corner
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x + 3 + this.width, point.y + 3 + this.height, 3 * 3, 0, 3, 3);

    // Top Edge
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x + 3, point.y, 3 * 6, 0, 1, 3, this.width, 3);
    // Bottom Edge
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x + 3, point.y + 3 + this.height, 3 * 7, 0, 1, 3, this.width, 3);
    // Left Edge
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x, point.y + 3, 3 * 4, 0, 3, 1, 3, this.height);
    // Right Edge
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x + 3 + this.width, point.y + 3, 3 * 5, 0, 3, 1, 3, this.height);

    // Fill
    GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x + 3, point.y + 3, 3 * 8, 0, 1, 1, this.width, this.height);
  }
}

export default WordBubble;
