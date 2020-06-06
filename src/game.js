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
import FexMath from '../engine/utils/FexMath.js';
import Light from '../engine/light.js';

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
const artificialCameraOffsetX = 0;
let artificialCameraOffsetY = 0;

const numberOfTilesInTheFloorX = 7;
const numberOfTilesInTheFloorY = 1;

let curtain = 0;
const curtainHeightFactor = 0.15;
let curtainSpeed = 0;

let pause = false;

const characterSpeed = 0.12;
const moveAcceleration = 0.0003;
const maxMoveVelocity = 0.1;
const friction = 0.00005;
const jumpVelocity = 0.3;
const gravity = 0.001;

const cameraFollowBox = {
  x: 0,
  y: -80,
  width: 50,
  height: 50,
  render(customCamera) {
    const {
      x, y, width, height,
    } = cameraFollowBox;
    GameplayRenderer.renderEmptyRectangle(x - customCamera.x, y - customCamera.y, width, height, 'green');
  },
};

const jumpMovement = Physics.buildJumpMovement(5, 0.01);
const jumpMovement2 = Physics.buildJumpMovement2(5);

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
    this.moveLeftDebug = this.moveLeftDebug.bind(this);
    this.moveDownDebug = this.moveDownDebug.bind(this);
    this.moveRightDebug = this.moveRightDebug.bind(this);
    this.moveUpDebug = this.moveUpDebug.bind(this);


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

    // TOCACHE
    this.getFinalCameraX = () => -(screen.width / 2 - (numberOfTilesInTheFloorX / 2) * GameplayGraphics.tileSize.w);
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
    this.character.addHitbox(0.2, 0.2, 0.6, 0.8);

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

    // this.lightSource = GameplayRenderer.createLightSource(
    //   this.character.position.x, this.character.position.y,
    //   30,
    //   255, 0, 255,
    //   1,
    // );

    this.light = new Light(
      this.character.position.x, this.character.position.y,
      this.character.width / 2 + 35,
      255, 0, 255,
      0.1,
    );
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

    // TOCACHE
    this.speech.render(camera);
    // cameraFollowBox.render(camera);

    // Curtain
    // TOCACHE
    const curtainHeight = screen.height * curtainHeightFactor * curtain;
    GameplayRenderer.fillStyle = 'black';
    GameplayRenderer.renderFullRectangle(0, 0, screen.width, curtainHeight);
    GameplayRenderer.renderFullRectangle(0, screen.height - curtainHeight, screen.width, curtainHeight);

    this.light.render(camera);

    this.renderLogic();

    // GameplayRenderer.renderLightSource(this.lightSource);

    if (showGrid) {
      renderer.renderWorldTileGrid(this.demoWorld, camera, this.collisionInfo);
      this.character.render(camera);
      this.character.hitbox.render(camera, this.zoneIndex >= 0);
    } else {
      this.character.render(camera);
    }

    if (pause) {
      GameplayGraphics.renderingContext2D.globalAlpha = 0.75;
      GameplayGraphics.renderer.fillStyle = 'black';
      GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);
      GameplayGraphics.renderingContext2D.globalAlpha = 1;
      GameplayGraphics.renderer.renderString('PAUSE', (screen.width / 2) - ('pause'.length / 2) * 6, screen.height / 2 - 2.5, fonts.normal);
    }

    FexDebug.logOnScreen('zone indexes', JSON.stringify(this.demoWorld.zoneIndexes));
    FexDebug.logOnScreen('slime velocity x', FexMath.precision(this.character.velocity.x));
    FexDebug.logOnScreen('slime velocity y', FexMath.precision(this.character.velocity.y));
    // FexDebug.logOnScreen('slime pos from cam x', this.character.position.x - camera.x);
    // FexDebug.logOnScreen('slime pos from cam y', this.character.position.y - camera.y);
    // FexDebug.logOnScreen('hitbox pos from cam x', this.character.hitbox.getAbsoluteX() - camera.x);
    // FexDebug.logOnScreen('hitbox pos from cam y', this.character.hitbox.getAbsoluteY() - camera.y);

    FexDebug.logOnScreen('hitbox pos x', FexMath.precision(this.character.hitbox.getAbsoluteX() + this.character.hitbox.absoluteWidth));
    FexDebug.logOnScreen('hitbox pos y', FexMath.precision(this.character.hitbox.getAbsoluteY() + this.character.hitbox.absoluteHieght));
  }

  postUpdate() {
    this.character.changeSpriteTo('idle');
  }

  onFocusLost() {
    if (pause) return;
    pause = true;

    const previousInput = { fired: this.fired, pressed: this.pressed, released: this.released };
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
      this.character.velocity.y += gravity * elapsedTime;
      // this.character.velocity.x -= friction * Math.sign(this.character.velocity.x) * elapsedTime;
      if (this.character.velocity.x > 0) {
        this.character.velocity.x = Math.max(0, this.character.velocity.x - friction * elapsedTime);
      } else if (this.character.velocity.x < 0) {
        this.character.velocity.x = Math.min(0, this.character.velocity.x + friction * elapsedTime);
      }

      this.light.x = this.character.position.x + this.character.width / 2;
      this.light.y = this.character.position.y + this.character.height / 2;

      // if (this.character.position.y > this.yFloor + GameplayGraphics.tileSize.h) {
      //   this.character.position.y = this.yFloor + GameplayGraphics.tileSize.h;
      //   this.character.resetAutomaticMovement();
      // }

      this.zoneIndex = this.demoWorld.getZoneIndex(this.character.hitbox);
      this.collisionInfo = this.demoWorld.getCollisionInfo(this.character);
      if (this.character.velocity.y === 0) {
        // this.character.resetAutomaticMovement();
      }

      this.speech.setBottomLeftCorner(this.character.position.x + 14, this.character.position.y);
      this.speech.update(elapsedTime);
      const cameraFollowBoxLeftBound = Math.min(cameraFollowBox.x, this.character.position.x);
      const cameraFollowBoxRightBound = Math.max(cameraFollowBox.x + cameraFollowBox.width, this.character.position.x + this.character.width);
      const cameraFollowBoxTopBound = Math.min(cameraFollowBox.y, this.character.position.y);
      const cameraFollowBoxBottomBound = Math.max(cameraFollowBox.y + cameraFollowBox.height, this.character.position.y + this.character.height);

      if (cameraFollowBox.x !== cameraFollowBoxLeftBound) {
        cameraFollowBox.x = cameraFollowBoxLeftBound;
      } else if (cameraFollowBox.x !== cameraFollowBoxRightBound - cameraFollowBox.width) {
        cameraFollowBox.x = cameraFollowBoxRightBound - cameraFollowBox.width;
      }
      if (cameraFollowBox.y !== cameraFollowBoxTopBound) {
        cameraFollowBox.y = cameraFollowBoxTopBound;
      } else if (cameraFollowBox.y !== cameraFollowBoxBottomBound - cameraFollowBox.height) {
        cameraFollowBox.y = cameraFollowBoxBottomBound - cameraFollowBox.height;
      }
    }
    // aca papu
    camera.x = artificialCameraOffsetX + Math.max(this.finalCameraX - 100, cameraFollowBox.x - (screen.width - cameraFollowBox.width) / 2);
    camera.y = artificialCameraOffsetY + Math.min(this.finalCameraY + 300, cameraFollowBox.y - (screen.height - cameraFollowBox.height) / 2);
  }

  idleUpdate(elapsedTime) {

  }

  initialCutSceneUpdate(elapsedTime) {
    curtain = Math.max(0, Math.min(1, curtain + curtainSpeed * elapsedTime));

    const cameraCutSceneSpeed = 0.05;
    const finalCameraX = this.getFinalCameraX();
    camera.x = Math.min(camera.x + elapsedTime * cameraCutSceneSpeed, finalCameraX);

    camera.y = -(screen.height * 0.6 - (numberOfTilesInTheFloorY / 2) * GameplayGraphics.tileSize.h);
    this.finalCameraY = camera.y;

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
    this.fired.Enter = this.fired.touchScreen.any = () => { camera.x = this.getFinalCameraX(); };
  }

  normalInput() {
    this.pressed = Scene.emptyInputState();
    this.released = Scene.emptyInputState();
    this.fired = Scene.emptyInputState();
    this.fired.KeyP = this.onFocusLost;
    this.pressed.ArrowUp = () => {
      artificialCameraOffsetY -= 1;
    };
    this.pressed.ArrowDown = () => {
      artificialCameraOffsetY += 1;
    };
    this.fired.KeyG = () => {
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


    this.pressed.KeyA = (x, y, elapsedTime) => this.moveLeftDebug(elapsedTime);
    this.pressed.KeyS = (x, y, elapsedTime) => this.moveDownDebug(elapsedTime);
    this.pressed.KeyD = (x, y, elapsedTime) => this.moveRightDebug(elapsedTime);
    this.pressed.KeyW = (x, y, elapsedTime) => this.moveUpDebug(elapsedTime);
  }

  isInUIRegion(x, y, x0, y0) {
    return x > x0 && x < x0 + this.uiButtonSize && y > y0 && y < y0 + this.uiButtonSize;
  }

  moveRight(elapsedTime) {
    this.character.changeSpriteTo('run');
    this.character.velocity.x = Math.min(
      maxMoveVelocity, this.character.velocity.x + moveAcceleration * elapsedTime,
    );
  }

  moveLeft(elapsedTime) {
    this.character.changeSpriteTo('runInverse');
    this.character.velocity.x = Math.max(
      -maxMoveVelocity, this.character.velocity.x - moveAcceleration * elapsedTime,
    );
  }

  jump() {
    // this.character.setAutomaticMovement(jumpMovement2);
    this.character.velocity.y = -jumpVelocity;
  }

  moveLeftDebug(elapsedTime) {
    this.character.velocity.x = -0.1;
  }

  moveDownDebug(elapsedTime) {
    this.character.velocity.y += 0.1;
  }

  moveRightDebug(elapsedTime) {
    this.character.velocity.x = 0.1;
  }

  moveUpDebug(elapsedTime) {
    this.character.velocity.y += -0.1;
  }
}

export default Game;
