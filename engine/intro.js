import Scene from './scene.js';
import { GameplayGraphics } from './rendering.js';
import { resources } from './resources.js';
import FexDebug from './debug.js';

class Intro extends Scene {
  constructor() {
    FexDebug.logOnConsole('contructor');
    super();

    this.fade = 0;
    this.fadeSpeed = 0.005;
  }

  init() {
    FexDebug.logOnConsole('init');
    GameplayGraphics.renderer.fillStyle = 'black';
    this.fade = 0;
  }

  update() {
    this.fade += this.fadeSpeed;
    if (this.fade >= 1.25) {
      this.fadeSpeed = -0.01;
    }
    if (this.fade < 0) {
      this.onFinishCallBack();
    }
  }

  render() {
    const { screen } = GameplayGraphics;
    const prevOpacity = GameplayGraphics.renderingContext2D.globalAlpha;
    GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);

    GameplayGraphics.renderingContext2D.globalAlpha = Math.max(0, this.fade);
    GameplayGraphics.renderer.renderBitmapCentered(resources.fexLogo, resources.fexLogo.width * 2, resources.fexLogo.height * 2);
    GameplayGraphics.renderingContext2D.globalAlpha = prevOpacity;
  }
}

export default Intro;
