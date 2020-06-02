import Scene from '../engine/scene.js';
import { GameplayGraphics } from '../engine/rendering.js';
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
    const g = GameplayGraphics.renderingContext2D.createRadialGradient(
      GameplayGraphics.canvasWidth / 2, GameplayGraphics.canvasHeight / 2, 100, GameplayGraphics.canvasWidth / 2, GameplayGraphics.canvasHeight / 2, 0,
    );
    g.addColorStop(0, 'rgba(255, 0, 0, 0)');
    g.addColorStop(1, 'rgba(255, 0, 0, 0.25)');
    const gradient = GameplayGraphics.renderingContext2D.createLinearGradient(0, 0, 0, GameplayGraphics.canvas.height);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 1)');
    GameplayGraphics.renderer.fillStyle = gradient;
    this.gradient = g;
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
    GameplayGraphics.renderingContext2D.fillRect(0, 0, GameplayGraphics.canvasWidth, GameplayGraphics.canvasHeight);
    GameplayGraphics.renderer.fillStyle = this.gradient;
    GameplayGraphics.renderingContext2D.fillRect(0, 0, GameplayGraphics.canvasWidth, GameplayGraphics.canvasHeight);

    const prevOpacity = GameplayGraphics.renderingContext2D.globalAlpha;

    GameplayGraphics.renderer.alpha = this.fade;
    GameplayGraphics.renderer.renderBitmapCentered(resources.fexLogo);
    GameplayGraphics.renderer.alpha = prevOpacity;
  }
}

export default Intro;
