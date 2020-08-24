import { GameplayRenderer, GameplayGraphics } from './rendering.js';

class PlaneSurface {
  constructor(bitmap, x = 0, y = 0) {
    this.bitmap = bitmap;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.xTimes = GameplayGraphics.screen.width / this.bitmap.width + 1;
  }

  update(elapsedTime) {

  }

  render(camera) {
    for (let i = 0; i < this.xTimes; ++i) {
      const realXStart = this.position.x - camera.x;
      const fakeXStart = realXStart - (this.bitmap.width * (Math.floor(realXStart / this.bitmap.width) + 1));
      const x = fakeXStart + i * this.bitmap.width;
      const y = this.position.y - camera.y;
      GameplayRenderer.renderBitmap(this.bitmap, x, y);
      GameplayRenderer.renderSubBitmap(
        this.bitmap, x, y + this.bitmap.height,
        0, this.bitmap.height - 1,
        this.bitmap.width, 1, this.bitmap.width, GameplayGraphics.screen.height,
      );
    }
  }
}

export default PlaneSurface;
