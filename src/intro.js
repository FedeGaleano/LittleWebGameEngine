import Scene from '../engine/scene.js';
import { GameplayGraphics, GameplayRenderer } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import InputBuffer from '../engine/InputBuffer.js';
import TouchScreenArea from '../engine/TouchScreenArea.js';
import Entity from '../engine/entity.js';
import Sprite from '../engine/sprite.js';
import Bound from '../engine/Bound.js';

class Intro extends Scene {
  constructor() {
    super();

    this.fade = 0;
    this.fadeSpeed = 0.0005;

    this.fired.Enter = () => this.finish();
    this.fired.touchScreen.any = () => this.finish();
  }

  init() {
    FexDebug.logOnConsole('intro init');
    const { screen } = GameplayGraphics;

    const logoSprite = new Sprite(
      resources.fexIntro, 13,
      [3500, ...Array(12).fill(25)], GameplayGraphics,
    );

    this.logo = new Entity({ normal: logoSprite }, { startingSpriteKey: 'normal' },
      (screen.width - logoSprite.width) / 2, (screen.height - logoSprite.height) / 2);

    this.fade = 0;
    this.registerVolatileTouchScreenArea(
      new TouchScreenArea(
        20, 20, screen.width - 40, screen.height - 40, GameplayGraphics,
        'any',
      ),
    );
  }

  onScreenResize() {
    const { screen } = GameplayGraphics;
    this.logo.x = (screen.width - this.logo.width) / 2;
    this.logo.y = (screen.height - this.logo.height) / 2;
  }

  update(elapsedTime) {
    this.fade += this.fadeSpeed * elapsedTime;
    if (this.fade >= 1.75) {
      this.fadeSpeed = -0.001;
    }
    if (this.fade < 0) {
      this.finish();
    }
    this.logo.update(elapsedTime);
  }

  render() {
    GameplayRenderer.fillStyle = 'black';
    GameplayRenderer.renderFullRectangle();

    const prevOpacity = GameplayRenderer.alpha;

    GameplayRenderer.alpha = this.fade;
    this.logo.render();
    GameplayRenderer.alpha = prevOpacity;
  }
}

export default Intro;
