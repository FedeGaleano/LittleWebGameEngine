import Scene from './scene.js';
import { GameplayGraphics } from './rendering.js';
import { resources } from './resources.js';
import FexDebug from './debug.js';
import InputBuffer from './InputBuffer.js';
import TouchScreenArea from './TouchScreenArea.js';

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
    GameplayGraphics.renderer.fillStyle = 'black';
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
    const prevOpacity = GameplayGraphics.renderingContext2D.globalAlpha;
    GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);

    GameplayGraphics.renderer.alpha = this.fade;
    GameplayGraphics.renderer.renderBitmapCentered(resources.fexLogo, resources.fexLogo.width * 2, resources.fexLogo.height * 2);
    GameplayGraphics.renderer.alpha = prevOpacity;
  }
}

export default Intro;
