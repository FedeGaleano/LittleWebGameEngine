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
import Physics from '../engine/physics/Physics.js';
import TouchScreenArea from '../engine/TouchScreenArea.js';

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

const characterSpeed = 0.1;

const cameraFollowBox = {
  x: 0,
  y: -80,
  width: 50,
  height: 80,
  render(customCamera) {
    const {
      x, y, width, height,
    } = cameraFollowBox;
    GameplayRenderer.renderEmptyRectangle(x - customCamera.x, y - customCamera.y, width, height, 'green');
  },
};

const jumpMovement = Physics.buildJumpMovement(5, 0.01);

class Game extends Scene {
  constructor() {
    super();
    this.unpause = this.unpause.bind(this);
    this.idleInput = this.idleInput.bind(this);
    this.normalInput = this.normalInput.bind(this);
    this.cutSceneInput = this.cutSceneInput.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.moveLeft = this.moveLeft.bind(this);
    this.jump = this.jump.bind(this);
    this.idleUpdate = this.idleUpdate.bind(this);
    this.initialCutSceneUpdate = this.initialCutSceneUpdate.bind(this);
    this.normalUpdate = this.normalUpdate.bind(this);

    this.spriteSlimeIdle = null;
    this.spriteSlimeRunning = null;
    this.leftButtonSprite = null;
    this.rightButtonSprite = null;
    this.jumpButtonSprite = null;

    this.character = null;
    this.leftButton = null;
    this.rightButton = null;
    this.jumpButton = null;
    this.speech = null;
    this.demoWorld = null;
  }

  init() {
    renderer.fillStyle = 'green';
    renderer.strokeStyle = '#00FFFF';

    this.uiButtonSize = resources.uiButtonLeft.width;

    this.spriteSlimeIdle = new Sprite(resources.character, 4, [100, 200, 100, 200], GameplayGraphics);
    this.spriteSlimeRunning = new Sprite(resources.characterRunning, 4, [100, 100, 150, 100], GameplayGraphics);
    this.spriteSlimeRunningInverse = new Sprite(resources.characterRunningInverse, 4, [100, 100, 150, 100], GameplayGraphics);

    this.leftButtonSprite = new Sprite(resources.uiButtonLeft, 1, [1], GameplayGraphics);
    this.leftButton = new Entity(
      { normal: this.leftButtonSprite },
      { startingSpriteKey: 'normal' },
      10, screen.height - 10 - this.uiButtonSize,
    );

    this.rightButtonSprite = new Sprite(resources.uiButtonRight, 1, [1], GameplayGraphics);
    this.rightButton = new Entity(
      { normal: this.rightButtonSprite },
      { startingSpriteKey: 'normal' },
      10 + this.uiButtonSize + 10, screen.height - 10 - this.uiButtonSize,
    );

    this.jumpButtonSprite = new Sprite(resources.uiButtonAction, 1, [1], GameplayGraphics);
    this.jumpButton = new Entity(
      { normal: this.jumpButtonSprite },
      { startingSpriteKey: 'normal' },
      screen.width - 10 - this.uiButtonSize, screen.height - 10 - this.uiButtonSize,
    );

    this.leftButtonTouchScreenArea = new TouchScreenArea(
      this.leftButton.position.x, this.leftButton.position.y, this.leftButton.width, this.leftButton.height, GameplayGraphics, 'left',
    );
    this.rightButtonTouchScreenArea = new TouchScreenArea(
      this.rightButton.position.x, this.rightButton.position.y, this.rightButton.width, this.rightButton.height, GameplayGraphics, 'right',
    );
    this.jumpButtonTouchScreenArea = new TouchScreenArea(
      this.jumpButton.position.x, this.jumpButton.position.y, this.jumpButton.width, this.jumpButton.height, GameplayGraphics, 'jump',
    );

    this.anyTouchScreenArea = new TouchScreenArea(
      0, 0, GameplayGraphics.screen.width, GameplayGraphics.screen.height, GameplayGraphics, 'any',
    );


    this.registerVolatileTouchScreenArea(this.anyTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.leftButtonTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.rightButtonTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.jumpButtonTouchScreenArea);

    this.xFloor = GameplayGraphics.tileSize.w * 3;
    this.yFloor = -this.spriteSlimeIdle.height;
    this.character = new Entity(
      {
        idle: this.spriteSlimeIdle,
        run: this.spriteSlimeRunning,
        runInverse: this.spriteSlimeRunningInverse,
      }, { startingSpriteKey: 'idle' },
      this.xFloor, this.yFloor,
    );

    cameraFollowBox.x = this.character.position.x - (cameraFollowBox.width - this.character.width) / 2;
    camera.x = cameraFollowBox.x - (screen.width - cameraFollowBox.width) / 2;

    const dialogPoint = { x: this.character.position.x + 14, y: this.character.position.y };
    const dialogSpeed = 0.15;
    this.speech = new Speech(dialogPoint.x, dialogPoint.y, [
      [
        'Hola, soy Fexi, la mascota',
        'del motor Fex Engine',
      ],
      [
        'seguramente Fex',
        'ya te explico',
        'que esto no es',
        'un videojuego',
      ],
      [
        'pero aun asi',
        'sigues esperando eso',
        'porque el hype',
        'no te deja escuchar',
      ],
      [
        'asi que mi tarea aqui es...',
      ],
      [
        'repetirte que esto',
        'NO es un videojuego',
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


    // to start idle
    // this.updateLogic = this.idleUpdate;
    // this.renderLogic = () => {};
    // this.idleInput();

    // to start with cutScene
    this.updateLogic = this.initialCutSceneUpdate;
    this.renderLogic = () => {};
    this.cutSceneInput();
    curtain = -500;
    curtainSpeed = 0.003;
    camera.x = -screen.width;
    this.speechClosed = true;
  }

  update(elapsedTime) {
    if (!pause) {
      this.updateLogic(elapsedTime);
    }
  }

  render() {
    const { screen } = GameplayGraphics;

    renderer.clearScreen();

    // Render background
    // TOCACHE
    GameplayGraphics.renderer.renderBitmap(resources.background, 0, 0, screen.width, screen.height);

    // Render stars
    // TOCACHE
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

    // TOCACHE
    this.speech.render(camera);
    // cameraFollowBox.render(camera);

    // Curtain
    // TOCACHE
    const curtainHeight = screen.height * curtainHeightFactor * curtain;
    GameplayRenderer.fillStyle = 'black';
    GameplayRenderer.renderFullRectangle(0, 0, screen.width, curtainHeight);
    GameplayRenderer.renderFullRectangle(0, screen.height - curtainHeight, screen.width, curtainHeight);

    if (showGrid) {
      renderer.renderTileGrid();
    }

    this.renderLogic();

    if (pause) {
      GameplayGraphics.renderingContext2D.globalAlpha = 0.75;
      GameplayGraphics.renderer.fillStyle = 'black';
      GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);
      GameplayGraphics.renderingContext2D.globalAlpha = 1;
      GameplayGraphics.renderer.renderString('PAUSE', (screen.width / 2) - ('pause'.length / 2) * 6, screen.height / 2 - 2.5, fonts.normal);
    }
  }

  postUpdate() {
    this.character.changeSpriteTo('idle');
  }

  onFocusLost() {
    if (pause) return;
    pause = true;

    const previousInput = { fired: this.fired, pressed: this.pressed, released: this.released };
    this.deleteAllVolatileTouchScreenAreas();
    this.fired = Scene.emptyInputState();
    this.pressed = Scene.emptyInputState();
    this.released = Scene.emptyInputState();

    this.fired.KeyP = this.fired.touchScreen.any = () => this.unpause(previousInput);
  }

  renderUI() {
    this.leftButton.render();
    this.rightButton.render();
    this.jumpButton.render();
  }

  normalUpdate(elapsedTime) {
    // FexDebug.chargeHeavily();
    if (!pause) {
      curtain = Math.max(0, Math.min(1, curtain + curtainSpeed * elapsedTime));
      this.character.update(elapsedTime);


      if (this.character.position.y > this.yFloor) {
        this.character.position.y = this.yFloor;
        this.character.resetAutomaticMovement();
      }

      this.speech.setBottomLeftCorner(this.character.position.x + 14, this.character.position.y);
      this.speech.update(elapsedTime);
      const cameraFollowBoxLeftBound = Math.min(cameraFollowBox.x, this.character.position.x);
      const cameraFollowBoxRightBound = Math.max(cameraFollowBox.x + cameraFollowBox.width, this.character.position.x + this.character.width);

      if (cameraFollowBox.x !== cameraFollowBoxLeftBound) {
        cameraFollowBox.x = cameraFollowBoxLeftBound;
      } else if (cameraFollowBox.x !== cameraFollowBoxRightBound - cameraFollowBox.width) {
        cameraFollowBox.x = cameraFollowBoxRightBound - cameraFollowBox.width;
      }
    }

    camera.x = Math.max(this.finalCameraX - 100, cameraFollowBox.x - (screen.width - cameraFollowBox.width) / 2);
    camera.y = -(screen.height * 0.6 - (numberOfTilesInTheFloorY / 2) * GameplayGraphics.tileSize.h);
  }

  idleUpdate(elapsedTime) {

  }

  initialCutSceneUpdate(elapsedTime) {
    curtain = Math.max(0, Math.min(1, curtain + curtainSpeed * elapsedTime));

    const cameraCutSceneSpeed = 0.05;
    const finalCameraX = -(screen.width / 2 - (numberOfTilesInTheFloorX / 2) * GameplayGraphics.tileSize.w);
    camera.x = Math.min(camera.x + elapsedTime * cameraCutSceneSpeed, finalCameraX);

    camera.y = -(screen.height * 0.6 - (numberOfTilesInTheFloorY / 2) * GameplayGraphics.tileSize.h);

    if (camera.x === finalCameraX) {
      this.finalCameraX = finalCameraX;
      if (this.speechClosed) {
        this.speech.next();
        this.fired.Enter = this.fired.touchScreen.any = () => {
          this.speech.next();
        };
        this.speechClosed = false;
      }

      this.speech.update(elapsedTime);


      if (this.speech.complete) {
        curtainSpeed *= -1;
        this.updateLogic = this.normalUpdate;
        this.normalInput();
        this.renderLogic = this.renderUI;
      }
    }
  }

  unpause(previousInput) {
    this.fired = previousInput.fired;
    this.pressed = previousInput.pressed;
    this.released = previousInput.released;
    pause = false;
  }

  idleInput() {
    this.pressed = Scene.emptyInputState();
    this.released = Scene.emptyInputState();
    this.fired = Scene.emptyInputState();

    this.fired.Enter = this.fired.touchScreen.any = () => {
      curtainSpeed = 0.003;
      this.speech.next();
      this.updateLogic = this.initialCutSceneUpdate;
      this.cutSceneInput();
    };
  }

  cutSceneInput() {
    this.pressed = Scene.emptyInputState();
    this.released = Scene.emptyInputState();
    this.fired = Scene.emptyInputState();
    this.fired.KeyP = this.onFocusLost;
  }

  normalInput() {
    this.pressed = Scene.emptyInputState();
    this.released = Scene.emptyInputState();
    this.fired = Scene.emptyInputState();
    this.fired.KeyP = this.onFocusLost;
    this.fired.KeyD = () => {
      showGrid = !showGrid;
    };
    this.fired.KeyK = () => {
      this.speech.next();
    };

    this.pressed.touchScreen.left = (x, y, elapsedTime) => {
      this.moveLeft(elapsedTime);
    };
    this.pressed.touchScreen.right = (x, y, elapsedTime) => {
      this.moveRight(elapsedTime);
    };
    this.fired.touchScreen.jump = this.jump;

    this.fired.Click = (x, y) => {
      FexDebug.logOnScreen('clickazo', `(${x}, ${y})`);
    };

    this.fired.KeyC = () => {
      if (curtainSpeed === 0) {
        curtainSpeed = 0.003;
      } else {
        curtainSpeed *= -1;
      }
    };
    this.pressed.ArrowRight = (x, y, elapsedTime) => this.moveRight(elapsedTime);
    this.pressed.ArrowLeft = (x, y, elapsedTime) => this.moveLeft(elapsedTime);
    this.fired.Space = (x, y, elapsedTime) => this.jump(elapsedTime);
  }

  isInUIRegion(x, y, x0, y0) {
    return x > x0 && x < x0 + this.uiButtonSize && y > y0 && y < y0 + this.uiButtonSize;
  }

  moveRight(elapsedTime) {
    this.character.changeSpriteTo('run');
    this.character.position.x += characterSpeed * elapsedTime;
  }

  moveLeft(elapsedTime) {
    this.character.changeSpriteTo('runInverse');
    this.character.position.x -= characterSpeed * elapsedTime;
  }

  jump() {
    this.character.setAutomaticMovement(jumpMovement);
  }
}

export default Game;
