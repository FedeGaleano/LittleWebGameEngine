import { GameplayGraphics, GameplayRenderer } from '../engine/rendering.js';
import Sprite from '../engine/sprite.js';
import { resources, fonts } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import { World, exampleTileMapList, demoTileMapList } from './world.js';
import Entity from '../engine/entity.js';
import WordBubble from '../engine/wordBubble.js';
import Dialog from '../engine/dialog.js';
import Speech from '../engine/speech.js';
import Scene from '../engine/scene.js';

const ArrayNewFunctionalities = {
  removeIf(condition) {
    for (let i = 0; i < this.length; ++i) {
      if (condition(this[i])) {
        this.splice(i, 1);
        return true;
      }
    }
    return false;
  },
};
Object.assign(Array.prototype, ArrayNewFunctionalities);

// Debug
let showGrid = false;

const { renderer, screen } = GameplayGraphics;

const camera = { x: 0, y: 0 };


const numberOfTilesInTheFloorX = 7;
const numberOfTilesInTheFloorY = 1;

let curtain = 0;
const curtainHeightFactor = 0.15;
let curtainSpeed = 0;

let pause = false;

const characterSpeed = 1;

class Game extends Scene {
  constructor() {
    super();
    this.unpause = this.unpause.bind(this);
    this.normalInput = this.normalInput.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.moveLeft = this.moveLeft.bind(this);

    this.count = 0;
    this.spriteSlimeIdle = null;
    this.spriteSlimeRunning = null;
    this.character = null;
    this.speech = null;
    this.demoWorld = null;
  }

  init() {
    renderer.fillStyle = 'green';
    renderer.strokeStyle = '#00FFFF';
    this.count = 0;
    this.normalInput();
    this.spriteSlimeIdle = new Sprite(resources.character, 4, [6, 12, 6, 12], GameplayGraphics);
    this.spriteSlimeRunning = new Sprite(resources.characterRunning, 4, [6, 6, 9, 6], GameplayGraphics);
    this.spriteSlimeRunningInverse = new Sprite(resources.characterRunningInverse, 4, [6, 6, 9, 6], GameplayGraphics);
    this.character = new Entity(
      {
        idle: this.spriteSlimeIdle,
        run: this.spriteSlimeRunning,
        runInverse: this.spriteSlimeRunningInverse,
      }, { startingSpriteKey: 'idle', flip: false, flop: false },
      GameplayGraphics.tileSize.w * 3, -this.spriteSlimeIdle.height,
    );
    const dialogPoint = { x: this.character.x + 14, y: this.character.y };
    const dialogSpeed = 0.15;
    this.speech = new Speech(dialogPoint.x, dialogPoint.y, [
      // [
      //   'Hola, soy Fexi, la mascota',
      //   'del motor Fex Engine',
      // ],
      // [
      //   'seguramente Fex',
      //   'ya te explico',
      //   'que esto no es',
      //   'un videojuego',
      // ],
      // [
      //   'pero aun asi',
      //   'sigues esperando eso',
      //   'porque el hype',
      //   'no te deja escuchar',
      // ],
      // [
      //   'asi que mi tarea aqui es...',
      // ],
      // [
      //   'repetirte que esto',
      //   'NO es un videojuego',
      // ],
      [
        'Hola XD',
      ],
      [
        ':)',
      ],
      [
        '<3',
      ],
    ], dialogSpeed);

    // exampleWorld = new World(exampleTileMapList, [0, resources.tile], 10, 50);
    this.demoWorld = new World(
      demoTileMapList,
      [0, resources.tile], 0, 0,
    );

    this.uiButtonSize = resources.uiButtonLeft.width;
  }

  update() {
    if (!pause) {
      ++this.count;
      curtain = Math.max(0, Math.min(1, curtain + curtainSpeed));
      // FexDebug.logOnScreen('count', this.count);
      this.character.update();
      this.speech.setBottomLeftCorner(this.character.x + 14, this.character.y);
      this.speech.update();
    }

    camera.x = -(screen.width / 2 - (numberOfTilesInTheFloorX / 2) * GameplayGraphics.tileSize.w);
    camera.y = -(screen.height / 2 - (numberOfTilesInTheFloorY / 2) * GameplayGraphics.tileSize.h);
  }

  render() {
    const { screen } = GameplayGraphics;

    renderer.clearScreen();

    // Render background
    GameplayGraphics.renderer.renderBitmap(resources.background, 0, 0, screen.width, screen.height);

    // Render stars
    const xTimes = Math.ceil(screen.width / resources.stars.width);
    const yTimes = Math.ceil(screen.height / resources.stars.height);

    for (let j = 0; j < yTimes; ++j) {
      for (let i = 0; i < xTimes; ++i) {
        GameplayGraphics.renderer.renderBitmap(
          resources.stars, resources.stars.width * i, resources.stars.height * j,
        );
      }
    }

    this.demoWorld.render(camera);
    this.character.render(camera);
    this.speech.render(camera);

    // Curtain
    const curtainHeight = screen.height * curtainHeightFactor * curtain;
    GameplayRenderer.fillStyle = 'black';
    GameplayRenderer.renderFullRectangle(0, 0, screen.width, curtainHeight);
    GameplayRenderer.renderFullRectangle(0, screen.height - curtainHeight, screen.width, curtainHeight);

    GameplayRenderer.renderBitmap(resources.uiButtonLeft, 10, screen.height - 10 - this.uiButtonSize);
    GameplayRenderer.renderBitmap(resources.uiButtonRight, 10 + this.uiButtonSize + 10, screen.height - 10 - this.uiButtonSize);
    GameplayRenderer.renderBitmap(resources.uiButtonAction, screen.width - 10 - this.uiButtonSize, screen.height - 10 - this.uiButtonSize);

    if (showGrid) {
      renderer.renderTileGrid();
    }
    if (pause) {
      GameplayGraphics.renderingContext2D.globalAlpha = 0.75;
      GameplayGraphics.renderer.fillStyle = 'black';
      GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);
      GameplayGraphics.renderingContext2D.globalAlpha = 1;
      GameplayGraphics.renderer.renderString('PAUSE', (screen.width / 2) - ('pause'.length / 2) * 6, screen.height / 2 - 2.5, fonts.normal);
    }
  }

  onFocusLost() {
    pause = true;
    this.fired = {};
    this.fired.KeyP = this.fired.ScreenTouch = () => this.unpause();

    this.released.ArrowRight = () => {
      this.character.changeSpriteTo('idle');
    };
  }

  unpause() {
    this.normalInput();
    pause = false;
  }

  normalInput() {
    this.pressed = {};
    this.released = {};
    this.fired = {};
    this.fired.KeyP = this.onFocusLost;
    this.fired.KeyD = () => {
      showGrid = !showGrid;
    };
    this.fired.KeyK = () => {
      this.speech.next();
    };

    this.fired.ScreenTouch = (x, y) => {
      FexDebug.logOnScreen('touchazo', `(${x}, ${y})`);

      if (this.isInUIRegion(x, y, 10, screen.height - 10 - this.uiButtonSize)) { // ui button left

      }
      if (this.isInUIRegion(x, y, 10 + this.uiButtonSize + 10, screen.height - 10 - this.uiButtonSize)) { // ui button right

      }
      if (this.isInUIRegion(screen.width - 10 - this.uiButtonSize, screen.height - 10 - this.uiButtonSize)) { // ui button action
        this.speech.next();
      }
    };

    this.fired.Click = (x, y) => {
      FexDebug.logOnScreen('clickazo', `(${x}, ${y})`);
    };

    this.fired.KeyC = () => {
      if (curtainSpeed === 0) {
        curtainSpeed = 0.05;
      } else {
        curtainSpeed *= -1;
      }
    };
    this.pressed.ArrowRight = this.moveRight;
    this.pressed.ArrowLeft = this.moveLeft;
    this.released.ArrowRight = () => {
      this.character.changeSpriteTo('idle');
    };
    this.released.ArrowLeft = () => {
      this.character.changeSpriteTo('idle');
    };
    this.released.ScreenTouch = () => {
      this.character.changeSpriteTo('idle');
    };
  }

  isInUIRegion(x, y, x0, y0) {
    return x > x0 && x < x0 + this.uiButtonSize && y > y0 && y < y0 + this.uiButtonSize;
  }

  moveRight() {
    this.character.changeSpriteTo('run');
    this.character.x += characterSpeed;
  }

  moveLeft() {
    this.character.changeSpriteTo('runInverse');
    this.character.x -= characterSpeed;
  }
}

export default Game;
