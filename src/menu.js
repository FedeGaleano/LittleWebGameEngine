/* eslint-disable class-methods-use-this */
import Scene from '../engine/scene.js';
import { GameplayRenderer, GameplayGraphics } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';

class Menu extends Scene {
  constructor() {
    super();
    this.audio = new Audio('res/select2.wav');
    const finishScene = () => {
      this.audio.play();
      this.finish();
    };
    this.fired.Enter = finishScene;
    this.fired.ScreenTouch = finishScene;
    this.starPanels = [];
    this.xTimes = 0;
    this.starsVelocity = 0.025;
  }

  init() {
    const { screen } = GameplayGraphics;
    GameplayRenderer.fillStyle = 'red';
    this.xTimes = Math.ceil(screen.width / resources.stars.width);
    for (let index = 0; index < this.xTimes; ++index) {
      this.starPanels.push(screen.width - resources.stars.width * (1 + index));
    }
  }

  update(elapsedTime) {
    const { screen } = GameplayGraphics;
    for (let index = 0; index < this.starPanels.length; ++index) {
      this.starPanels[index] += this.starsVelocity * elapsedTime;
    }

    this.starPanels.removeIf(x => x > screen.width + 10);

    if (this.starPanels[this.starPanels.length - 1] > -10) {
      this.starPanels.push(this.starPanels[this.starPanels.length - 1] - resources.stars.width);
    }

    FexDebug.logOnScreen('panels', this.starPanels.length);
  }

  render(camera) {
    const { screen } = GameplayGraphics;
    GameplayRenderer.clearScreen();
    GameplayRenderer.renderBitmap(resources.background, 0, 0, screen.width, screen.height);

    for (let index = 0; index < this.starPanels.length; ++index) {
      GameplayRenderer.renderBitmap(
        resources.stars,
        this.starPanels[index], 0,
      );
    }

    GameplayRenderer.renderBitmap(
      resources.title,
      screen.width / 2 - resources.title.width / 2,
      screen.height * 0.25 - resources.title.height / 2,
    );
    GameplayRenderer.renderBitmap(
      resources.playButton,
      screen.width / 2 - resources.playButton.width / 2,
      screen.height * 0.6 - resources.playButton.height / 2,
    );
  }

  mouseOver(x, y) {
    const x0 = GameplayGraphics.screen.width / 2 - resources.playButton.width / 2;
    const y0 = GameplayGraphics.screen.height / 2 - resources.playButton.height / 2;
    FexDebug.logOnScreen('cursor relative', `(${x}, ${y})`);
  }
}

export default Menu;
