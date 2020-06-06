import Scene from '../engine/scene.js';
import { GameplayGraphics, GameplayRenderer } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import InputBuffer from '../engine/InputBuffer.js';
import TouchScreenArea from '../engine/TouchScreenArea.js';

class Intro extends Scene {
  constructor() {
    super();

    this.fade = 0;
    this.fadeSpeed = 0.005;

    this.fired.Enter = () => this.finish();
    this.fired.touchScreen.any = () => this.finish();
  }

  init() {
    FexDebug.logOnConsole('init');

    this.fade = 0;
    this.registerVolatileTouchScreenArea(
      new TouchScreenArea(
        0, 0, GameplayGraphics.screen.width, GameplayGraphics.screen.height, GameplayGraphics,
        'any',
      ),
    );
  }

  update() {
    this.fade += this.fadeSpeed;
    if (this.fade >= 1.25) {
      this.fadeSpeed = -0.01;
    }
    if (this.fade < 0) {
      this.finish();
    }
  }

  render() {
    const { screen } = GameplayGraphics;
    // GameplayGraphics.renderer.clearScreen();
    GameplayGraphics.renderer.fillStyle = 'black';
    GameplayRenderer.renderFullRectangle();

    const prevOpacity = GameplayGraphics.renderingContext2D.globalAlpha;

    GameplayGraphics.renderer.alpha = this.fade;
    GameplayGraphics.renderer.renderBitmapCentered(resources.fexLogo);
    GameplayGraphics.renderer.alpha = prevOpacity;
  }
}

export default Intro;
