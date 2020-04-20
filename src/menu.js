/* eslint-disable class-methods-use-this */
import Scene from '../engine/scene.js';
import { GameplayRenderer, GameplayGraphics } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';

class Menu extends Scene {
  constructor() {
    super();
    this.fired.Enter = () => this.onFinishCallBack();
    this.fired.Click = (x, y) => {
      FexDebug.logOnScreen('clickazo', `(${x}, ${y})`);
    };
    this.fired.ScreenTouch = (x, y) => {
      FexDebug.logOnScreen('touchazo', `(${x}, ${y})`);
      this.onFinishCallBack();
    };
  }

  init() {
    GameplayRenderer.fillStyle = 'red';
  }

  update() {

  }

  render(camera) {
    GameplayRenderer.clearScreen();
    GameplayRenderer.renderBitmap(resources.background, 0, 0, GameplayGraphics.screen.width, GameplayGraphics.screen.height);
    GameplayRenderer.renderString('el juego ah xd', 20, 20, resources.font);
    GameplayRenderer.renderBitmapCentered(resources.stars);
    GameplayRenderer.renderBitmapCentered(resources.playButton);
  }

  mouseOver(x, y) {
    const x0 = GameplayGraphics.screen.width / 2 - resources.playButton.width / 2;
    const y0 = GameplayGraphics.screen.height / 2 - resources.playButton.height / 2;
    FexDebug.logOnScreen('cursor relative', `(${x}, ${y})`);
  }
}

export default Menu;
