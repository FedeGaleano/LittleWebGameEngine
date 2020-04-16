import Scene from '../engine/scene.js';
import { GameplayRenderer, GameplayGraphics } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';

class Menu extends Scene {
  constructor() {
    super();
    // const cb = () => this.onFinishCallBack();
    // this.fired = {
    //   Enter() {
    //     this.onFinishCallBack();
    //   },
    // };
    this.fired.Enter = () => this.onFinishCallBack();
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
  }
}

export default Menu;
