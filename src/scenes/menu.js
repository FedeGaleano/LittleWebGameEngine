/* eslint-disable class-methods-use-this */
import Scene from '../../engine/scene.js';
import { GameplayRenderer, GameplayGraphics } from '../../engine/rendering.js';
import { resources, fonts } from '../../engine/resources.js';
import FexDebug from '../../engine/debug.js';
import InputBuffer from '../../engine/InputBuffer.js';
import TouchScreenArea from '../../engine/TouchScreenArea.js';
import FexUtils from '../../engine/utils/FexUtils.js';
import Fexi from '../Fexi.js';

const pressEnterText = 'PRESS ENTER TO START';
const blinkTimeInMillis = 500;

class Menu extends Scene {
  constructor() {
    super();
    this.audio = new Audio('res/select2.wav');
    this.starPanels = [];
    this.xTimes = 0;
    this.starsVelocity = 0.025;
    this.blink = true;
    this.fexi = null;
    this.titleX = null;
    this.titleY = null;
  }

  placePlayUIButton() {
    this.playButtonX = (GameplayGraphics.screen.width - resources.playButton.width) / 2;
    this.playButtonY = (GameplayGraphics.screen.height / 3) * 2 - resources.playButton.height / 2;

    this.registerVolatileTouchScreenArea(
      new TouchScreenArea(
        this.playButtonX, this.playButtonY, resources.playButton.width, resources.playButton.height, GameplayGraphics,
        'playUIButton',
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

    this.fexi = new Fexi();

    this.onScreenResize();

    const finishScene = () => {
      try {
        this.audio.play();
      } catch (error) {
        FexDebug.logOnConsole('Error from menu audio.play()', error);
      }
      this.finish();
    };
    this.createVirtualButton('startGame', {
      keys: ['Enter'],
      touchScreenAreas: ['playUIButton'],
    });
    this.onFired('startGame', finishScene);
    this.textLength = fonts.normal.measureText(pressEnterText);
    this.textHeight = fonts.normal.cellHeight;
  }

  update(elapsedTime, now) {
    const { screen } = GameplayGraphics;
    for (let index = 0; index < this.starPanels.length; ++index) {
      this.starPanels[index] += this.starsVelocity * elapsedTime;
    }

    this.starPanels.removeIf(x => x > screen.width + 10);

    if (this.starPanels[this.starPanels.length - 1] > -10) {
      this.starPanels.push(this.starPanels[this.starPanels.length - 1] - resources.stars.width);
    }

    this.blink = Math.round((now / blinkTimeInMillis)) % 4 === 0;
    this.fexi.update(elapsedTime);
  }

  renderPressStart() {
    const { screen } = GameplayGraphics;
    if (!this.blink) {
      const x = (screen.width - this.textLength) / 2;
      const y = screen.height * (2 / 3) - this.textHeight / 2;
      GameplayRenderer.fillStyle = 'black';
      GameplayRenderer.alpha = 0.5;
      GameplayRenderer.renderFullRectangle(x - 1, y - 1, fonts.normal.measureText(pressEnterText) + 1, fonts.normal.cellHeight - 1);
      GameplayRenderer.alpha = 1;
      GameplayRenderer.renderStringColored(pressEnterText,
        x, y,
        fonts.normal, 'grey');
    }
  }

  renderPlayButton() {
    GameplayRenderer.renderBitmap(
      resources.playButton,
      this.playButtonX, this.playButtonY,
    );
  }

  render() {
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
      this.titleX, this.titleY,
    );

    this.fexi.render();

    if (FexUtils.deviceHasTouch()) {
      this.renderPlayButton();
    } else {
      this.renderPressStart();
    }
  }

  onScreenResize() {
    this.placePlayUIButton();
    this.titleX = GameplayGraphics.screen.width / 2 - resources.title.width / 2;
    this.titleY = GameplayGraphics.screen.height * 0.25 - resources.title.height / 2;
    this.fexi.position.x = this.titleX + 92;
    this.fexi.position.y = this.titleY - this.fexi.height;
  }
}

export default Menu;
