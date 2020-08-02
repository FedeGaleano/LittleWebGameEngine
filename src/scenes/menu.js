/* eslint-disable class-methods-use-this */
import Scene from '../../engine/scene.js';
import { GameplayRenderer, GameplayGraphics } from '../../engine/rendering.js';
import { resources } from '../../engine/resources.js';
import FexDebug from '../../engine/debug.js';
import InputBuffer from '../../engine/InputBuffer.js';
import TouchScreenArea from '../../engine/TouchScreenArea.js';

class Menu extends Scene {
  constructor() {
    super();
    this.audio = new Audio('res/select2.wav');
    const finishScene = () => {
      try {
        this.audio.play();
      } catch (error) {
        FexDebug.logOnConsole('Error from menu audio.play()', error);
      }
      this.finish();
    };
    this.fired.keyboard.Enter = finishScene;
    this.fired.touchScreen.play = finishScene;
    this.starPanels = [];
    this.xTimes = 0;
    this.starsVelocity = 0.025;
  }

  placePlayButton() {
    this.playButtonX = GameplayGraphics.screen.width / 2 - resources.playButton.width / 2;
    this.playButtonY = GameplayGraphics.screen.height * 0.6 - resources.playButton.height / 2;

    this.registerVolatileTouchScreenArea(
      new TouchScreenArea(
        this.playButtonX, this.playButtonY, resources.playButton.width, resources.playButton.height, GameplayGraphics,
        'play',
      ),
    );
  }

  init() {
    FexDebug.logOnConsole('menu init()');

    const { screen } = GameplayGraphics;
    GameplayRenderer.fillStyle = 'red';
    this.xTimes = Math.ceil(screen.width / resources.stars.width);
    this.starPanels = [];
    for (let index = 0; index < this.xTimes; ++index) {
      this.starPanels.push(screen.width - resources.stars.width * (1 + index));
    }
    this.placePlayButton();
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
      this.playButtonX, this.playButtonY,
    );
  }

  mouseOver(x, y) {
    const x0 = GameplayGraphics.screen.width / 2 - resources.playButton.width / 2;
    const y0 = GameplayGraphics.screen.height / 2 - resources.playButton.height / 2;
    FexDebug.logOnScreen('cursor relative', `(${x}, ${y})`);
  }

  onScreenResize() {
    this.placePlayButton();
  }
}

export default Menu;
