import Scene from '../engine/scene.js';
import { resources } from '../engine/resources.js';
import { AskForRotationGraphics } from '../engine/rendering.js';
import Sprite from '../engine/sprite.js';

class RotatePhoneScene extends Scene {
  constructor() {
    super();
    this.rotationSprite = null;
  }

  init() {
    this.rotationSprite = new Sprite(
      resources.rotationImage, 4, [200, 200, 200, 400], AskForRotationGraphics,
    );
  }

  update(elapsedTime) {
    this.rotationSprite.update(elapsedTime);
  }

  render() {
    const { screen, renderer } = AskForRotationGraphics;
    renderer.clearScreen();
    this.rotationSprite.render(
      (screen.width - this.rotationSprite.frameWidth) / 2,
      (screen.height - this.rotationSprite.frameHeight) / 2,
    );
  }
}

export default RotatePhoneScene;
