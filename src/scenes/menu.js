/* eslint-disable class-methods-use-this */
import Scene from '../../engine/scene.js';
import { GameplayRenderer, GameplayGraphics } from '../../engine/rendering.js';
import { resources, fonts } from '../../engine/resources.js';
import FexDebug from '../../engine/debug.js';
import InputBuffer from '../../engine/InputBuffer.js';
import TouchScreenArea from '../../engine/TouchScreenArea.js';
import FexUtils from '../../engine/utils/FexUtils.js';
import Fexi from '../Fexi.js';
import FexMath from '../../engine/utils/FexMath.js';
import Localization from '../localization/localization.js';
import FexGlobals from '../../engine/utils/FexGlobals.js';

const blinkTimeInMillis = 500;
const languageFontHeight = 5;
const switchLanguageButtonSize = { w: 24, h: 18 };
const starPanelSurpassesScreen = x => x > GameplayGraphics.screen.width + 10;

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
    this.languageTitleX = null;
    this.languageTitleY = 160;
    this.languageIndex = 0;
    this.languages = [
      {
        text: 'English',
        reference: FexUtils.availableLanguages.ENGLISH,
      },
      {
        text: 'Español',
        reference: FexUtils.availableLanguages.SPANISH,
      },
    ];
    this.setLanguage(this.languageIndex);
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

  createBackground() {
    this.back = GameplayGraphics.renderingContext2D.createLinearGradient(0, 0, 0, GameplayGraphics.screen.height * GameplayGraphics.scale);
    this.back.addColorStop(0, '#190a2c');
    this.back.addColorStop(1, '#4b2cb2');
  }

  setLanguage(index) {
    FexGlobals.language.set(this.languages[index].reference);
  }

  init() {
    FexDebug.logOnConsole('menu init()');

    const { screen } = GameplayGraphics;
    this.xTimes = Math.ceil(screen.width / resources.stars.width);
    this.starPanels = [];
    for (let index = 0; index < this.xTimes; ++index) {
      this.starPanels.push(screen.width - resources.stars.width * (1 + index));
    }

    this.fexi = new Fexi();

    this.onScreenResize();

    const finishScene = () => {
      FexDebug.logOnConsole('Menu::finishScene() triggered');
      try {
        this.audio.play();
      } catch (error) {
        FexDebug.logOnConsole('Error from menu audio.play()', error);
      }
      this.finish();
    };
    const switchLanguageRight = () => {
      this.languageIndex = FexMath.modulus(this.languageIndex + 1, this.languages.length);
      this.setLanguage(this.languageIndex);
    };
    const switchLanguageLeft = () => {
      this.languageIndex = FexMath.modulus(this.languageIndex - 1, this.languages.length);
      this.setLanguage(this.languageIndex);
    };
    this.createVirtualButton('startGame', {
      keys: ['Enter'],
      touchScreenAreas: ['playUIButton'],
    });
    this.createVirtualButton('switchLanguageRight', {
      keys: ['ArrowRight'],
      touchScreenAreas: ['switchLanguageRight'],
    });
    this.createVirtualButton('switchLanguageLeft', {
      keys: ['ArrowLeft'],
      touchScreenAreas: ['switchLanguageLeft'],
    });
    this.onFired('startGame', finishScene);
    this.onFired('switchLanguageRight', switchLanguageRight);
    this.onFired('switchLanguageLeft', switchLanguageLeft);
    this.textLength = fonts.normal.measureText(Localization.PRESS_ENTER_TO_START);
    this.textHeight = fonts.normal.cellHeight;
  }

  update(elapsedTime, now) {
    for (let index = 0; index < this.starPanels.length; ++index) {
      this.starPanels[index] += this.starsVelocity * elapsedTime;
    }

    this.starPanels.removeIf(starPanelSurpassesScreen);

    if (this.starPanels[this.starPanels.length - 1] > -10) {
      this.starPanels.push(this.starPanels[this.starPanels.length - 1] - resources.stars.width);
    }

    this.blink = Math.round((now / blinkTimeInMillis)) % 4 === 0;
    this.fexi.update(elapsedTime);
  }

  renderPressStart() {
    const { screen } = GameplayGraphics;
    if (!this.blink) {
      const x = (screen.width - fonts.normal.measureText(Localization.PRESS_ENTER_TO_START)) / 2;
      const y = screen.height * (2 / 3) - this.textHeight / 2;
      GameplayRenderer.fillStyle = 'black';
      GameplayRenderer.alpha = 0.5;
      GameplayRenderer.renderFullRectangle(x - 1, y - 1, fonts.normal.measureText(Localization.PRESS_ENTER_TO_START) + 1, fonts.normal.cellHeight - 1);
      GameplayRenderer.alpha = 1;
      GameplayRenderer.renderStringColored(Localization.PRESS_ENTER_TO_START,
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

    GameplayRenderer.fillStyle = this.back;
    GameplayRenderer.renderFullRectangle();

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

    GameplayRenderer.renderStringColored(`<< ${this.languages[this.languageIndex].text} >>`, this.languageTitleX, this.languageTitleY, fonts.normal, 'white');
  }

  onScreenResize() {
    this.createBackground();
    this.placePlayUIButton();
    this.titleX = GameplayGraphics.screen.width / 2 - resources.title.width / 2;
    this.titleY = GameplayGraphics.screen.height * 0.25 - resources.title.height / 2;
    this.languageTitleX = GameplayGraphics.screen.width / 2 - fonts.normal.measureText(`<< ${this.languages[this.languageIndex].text} >>`) / 2;

    this.registerVolatileTouchScreenArea(
      new TouchScreenArea(
        this.languageTitleX - switchLanguageButtonSize.w / 2,
        this.languageTitleY + languageFontHeight / 2 - switchLanguageButtonSize.h / 2,
        switchLanguageButtonSize.w,
        switchLanguageButtonSize.h,
        GameplayGraphics,
        'switchLanguageLeft',
      ),
    );
    this.registerVolatileTouchScreenArea(
      new TouchScreenArea(
        this.languageTitleX + fonts.normal.measureText(`<< ${this.languages[this.languageIndex].text} >>`) - switchLanguageButtonSize.w / 2,
        this.languageTitleY + languageFontHeight / 2 - switchLanguageButtonSize.h / 2,
        switchLanguageButtonSize.w,
        switchLanguageButtonSize.h,
        GameplayGraphics,
        'switchLanguageRight',
      ),
    );
    this.fexi.position.x = this.titleX + 92;
    this.fexi.position.y = this.titleY - this.fexi.height;
  }
}

export default Menu;
