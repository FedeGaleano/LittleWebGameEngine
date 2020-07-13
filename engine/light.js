import { GameplayRenderer, GameplayGraphics } from './rendering.js';

class Light {
  constructor(x, y, radius, r, g, b, intensity) {
    this.lightSource = GameplayRenderer.createLightSource(x, y, radius, r, g, b, intensity);
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.r = r;
    this.g = g;
    this.b = b;
    this.intensity = intensity;
  }

  render(camera) {
    this.setScreenPosition(camera);

    GameplayGraphics.renderingContext2D.globalCompositeOperation = 'lighter';
    GameplayRenderer.renderLightSource(this.lightSource);
    GameplayGraphics.renderingContext2D.globalCompositeOperation = 'source-over';
  }

  setScreenPosition(camera) {
    this.lightSource = GameplayRenderer.createLightSource(
      this.x - camera.x, this.y - camera.y, this.radius, this.r, this.g, this.b, this.intensity,
    );
  }

  // setScreenPosition(x, y) {
  //   this.x = x;
  //   this.y = y;
  //   this.lightSource = GameplayRenderer.createLightSource(
  //     this.x, this.y, this.radius, this.r, this.g, this.b, this.intensity,
  //   );
  // }
}

export default Light;
