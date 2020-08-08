import { GameplayGraphics, GameplayRenderer } from '../../engine/rendering.js';
import Sprite from '../../engine/sprite.js';
import {
  resources, fonts, tileMaps, tilesets,
} from '../../engine/resources.js';
import FexDebug from '../../engine/debug.js';
import { World } from '../world.js';
import Entity from '../../engine/entity.js';
import Speech from '../../engine/speech.js';
import Scene from '../../engine/scene.js';
import Physics from '../../engine/physics/Physics.js';
import TouchScreenArea from '../../engine/TouchScreenArea.js';
import FexMath from '../../engine/utils/FexMath.js';
import Light from '../../engine/light.js';
import Bound from '../../engine/Bound.js';
import FexUtils from '../../engine/utils/FexUtils.js';
import InputBuffer from '../../engine/InputBuffer.js';
import Fexi from '../Fexi.js';

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
const starsParallax = 0.25;

let curtain = 0;
const curtainHeightFactor = 0.15;
let curtainSpeed = 0;

let pause = false;

// const getMoveAcceleration = max => (max ? 0.01 : 0.0006);
// const getMoveAcceleration = () => 0.0007;
const maxMoveVelocity = 0.1;
const getMoveAcceleration = () => 0.0007;
const maxJumpVelocity = 0.32;
const gravity = 0.001;
// const maxJumpVelocity = 0.5;
// const gravity = 0.002;
const coyoteTime = 100;
const prematureJumpTolerance = 100;
const waterVelocity = 0.7;

const cameraFollowBox = {
  // (x, y) set on init()
  x: 0,
  y: 0,
  width: 50,
  height: 50,
  render(customCamera) {
    const {
      x, y, width, height,
    } = cameraFollowBox;
    GameplayRenderer.renderEmptyRectangle(x - customCamera.x, y - customCamera.y, width, height, 'magenta');
  },
};

const jumpMovement = Physics.buildJumpMovement(5, 0.01);
const jumpMovement2 = Physics.buildJumpMovement2(5);

const characterTilePositionX = 27;
const characterTilePositionY = 63;
const keyTilePositionX = 28;
const keyTilePositionY = 51;
const flagTilePositionX = 27;
const flagTilePositionY = 0;
const waterTilePositionX = 0;
const waterTilePositionY = 64;
const triggerZoneCoords = {
  // less than
  xTile: 20,
  yTile: 57,

  // these two are set in Game.init after world creation using the tile coords above
  x: null,
  y: null,
};

const touchMargin = 10;

class Game extends Scene {
  static get camera() {
    return camera;
  }

  static get cameraFollowBox() {
    return cameraFollowBox;
  }

  constructor() {
    super();
    this.unpause = this.unpause.bind(this);
    this.idleInput = this.idleInput.bind(this);
    this.normalInput = this.normalInput.bind(this);
    this.cutSceneInput = this.cutSceneInput.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.moveLeft = this.moveLeft.bind(this);
    this.tryToJump = this.tryToJump.bind(this);
    this.jump = this.jump.bind(this);
    this.interruptJumpingAcceleration = this.interruptJumpingAcceleration.bind(this);
    this.moveLeftDebug = this.moveLeftDebug.bind(this);
    this.moveDownDebug = this.moveDownDebug.bind(this);
    this.moveRightDebug = this.moveRightDebug.bind(this);
    this.moveUpDebug = this.moveUpDebug.bind(this);
    this.updateCameraFollowBox = this.updateCameraFollowBox.bind(this);

    this.idleUpdate = this.idleUpdate.bind(this);
    this.initialCutSceneUpdate = this.initialCutSceneUpdate.bind(this);
    this.normalUpdate = this.normalUpdate.bind(this);

    this.createBackground = this.createBackground.bind(this);
    this.decideGravity = this.modifyGravity.bind(this);

    this.leftButtonSprite = null;
    this.leftButtonPressedSprite = null;
    this.rightButtonSprite = null;
    this.rightButtonPressedSprite = null;
    this.jumpButtonSprite = null;
    this.jumpButtonPressedSprite = null;

    // Entities
    this.character = null;
    this.key = null;
    this.flag = null;
    this.water = null;

    // UI
    this.leftButton = null;
    this.rightButton = null;
    this.jumpButton = null;
    this.pauseButton = null;

    // Others
    this.speech = null;
    this.demoWorld = null;
    this.starPanels = [];

    this.createBackground();

    // Final camera coords
    this.getFinalCameraX = null;
    this.getFinalCameraY = null;
    this.finalCameraX = null;
    this.finalCameraY = null;

    this.resetAlpha = 0;
    this.resetAlphaSpeed = 0.05;
  }

  onScreenResize() {
    /* Things that MUST be initialized:
        -this.uiButtonSize
        -this.leftButton
        -this.rightButton
        -this.jumpButton
        -this.pauseButton
        -this.leftButtonTouchScreenArea
        -this.rightButtonTouchScreenArea
        -this.jumpButtonTouchScreenArea
        -this.pauseButtonTouchScreenArea
        -this.anyTouchScreenArea
        -this.getFinalCameraX()
        -this.getFinalCameraY()
        -cameraFollowBox.x
        -cameraFollowBox.y
    */

    this.leftButton.position.x = 10;
    this.leftButton.position.y = screen.height - 10 - this.uiButtonSize;

    this.rightButton.position.x = 10 + this.uiButtonSize + 10;
    this.rightButton.position.y = screen.height - 10 - this.uiButtonSize;

    this.jumpButton.position.x = screen.width - 10 - this.uiButtonSize;
    this.jumpButton.position.y = screen.height - 10 - this.uiButtonSize;

    this.pauseButton.position.x = screen.width - 10 - this.pauseButton.width;
    this.pauseButton.position.y = 10;


    this.pauseButton.upperLeftCornerX = this.leftButton.position.x - 10;
    this.leftButtonTouchScreenArea.upperLeftCornerY = this.leftButton.position.y - 10;

    this.rightButtonTouchScreenArea.upperLeftCornerX = this.rightButton.position.x - 5;
    this.rightButtonTouchScreenArea.upperLeftCornerY = this.rightButton.position.y - 10;

    this.jumpButtonTouchScreenArea.upperLeftCornerX = this.jumpButton.position.x - 15;
    this.jumpButtonTouchScreenArea.upperLeftCornerY = this.jumpButton.position.y - 10;

    this.pauseButtonTouchScreenArea.upperLeftCornerX = this.pauseButton.position.x - 15;
    this.pauseButtonTouchScreenArea.upperLeftCornerY = this.pauseButton.position.y - 10;

    this.anyTouchScreenArea.width = GameplayGraphics.screen.width - touchMargin * 2;
    this.anyTouchScreenArea.height = GameplayGraphics.screen.height - touchMargin * 2;

    this.timeInAir = 0;
    this.wasInAir = false;
    this.isInAir = false;
    this.hasJumped = false;
    this.jumpRequestTime = null;

    this.finalCameraX = this.getFinalCameraX();
    this.finalCameraY = this.getFinalCameraY();
  }

  placeEntityOverTile(entity, xTile, yTile, zoneIndex = 0) {
    this.demoWorld.copyTileCoordsInBound(
      zoneIndex, xTile, yTile, entity.position,
    );
    entity.position.y -= entity.height;
    entity.position.x += Math.round((GameplayGraphics.tileSize.w - entity.width) / 2);
  }

  init() {
    renderer.fillStyle = 'green';
    renderer.strokeStyle = '#00FFFF';

    this.uiButtonSize = resources.uiButtonLeft.width;

    this.leftButtonSprite = new Sprite(resources.uiButtonLeft, 1, [1], GameplayGraphics);
    this.leftButtonPressedSprite = new Sprite(resources.uiButtonLeftPressed, 1, [1], GameplayGraphics);
    this.leftButton = new Entity(
      { normal: this.leftButtonSprite, pressed: this.leftButtonPressedSprite },
      { startingSpriteKey: 'normal' },
      10, screen.height - 10 - this.uiButtonSize,
    );

    this.rightButtonSprite = new Sprite(resources.uiButtonRight, 1, [1], GameplayGraphics);
    this.rightButtonPressedSprite = new Sprite(resources.uiButtonRightPressed, 1, [1], GameplayGraphics);
    this.rightButton = new Entity(
      { normal: this.rightButtonSprite, pressed: this.rightButtonPressedSprite },
      { startingSpriteKey: 'normal' },
      10 + this.uiButtonSize + 10, screen.height - 10 - this.uiButtonSize,
    );

    this.jumpButtonSprite = new Sprite(resources.uiButtonAction, 1, [1], GameplayGraphics);
    this.jumpButtonPressedSprite = new Sprite(resources.uiButtonActionPressed, 1, [1], GameplayGraphics);
    this.jumpButton = new Entity(
      { normal: this.jumpButtonSprite, pressed: this.jumpButtonPressedSprite },
      { startingSpriteKey: 'normal' },
      screen.width - 10 - this.uiButtonSize, screen.height - 10 - this.uiButtonSize,
    );

    this.pauseButtonSprite = new Sprite(resources.uiButtonPause, 1, [1], GameplayGraphics);
    this.unpauseButtonSprite = new Sprite(resources.uiButtonUnpause, 1, [1], GameplayGraphics);
    this.pauseButton = new Entity(
      { pause: this.pauseButtonSprite, unpause: this.unpauseButtonSprite },
      { startingSpriteKey: 'pause' },
      screen.width - 10 - this.uiButtonSize, screen.height - 10 - this.uiButtonSize,
    );

    this.leftButtonTouchScreenArea = new TouchScreenArea(
      this.leftButton.position.x - 5, this.leftButton.position.y - 5, this.leftButton.width + 15, this.leftButton.height + 20, GameplayGraphics, 'left',
    );
    this.rightButtonTouchScreenArea = new TouchScreenArea(
      this.rightButton.position.x - 5, this.rightButton.position.y - 5, this.rightButton.width + 15, this.rightButton.height + 20, GameplayGraphics, 'right',
    );
    this.jumpButtonTouchScreenArea = new TouchScreenArea(
      this.jumpButton.position.x - 5, this.jumpButton.position.y - 5, this.jumpButton.width + 25, this.jumpButton.height + 20, GameplayGraphics, 'jump',
    );
    this.pauseButtonTouchScreenArea = new TouchScreenArea(
      this.pauseButton.position.x - 5, this.pauseButton.position.y - 5, this.pauseButton.width + 25, this.pauseButton.height + 20, GameplayGraphics, 'pause',
    );

    this.anyTouchScreenArea = new TouchScreenArea(
      touchMargin, touchMargin,
      GameplayGraphics.screen.width - touchMargin * 2, GameplayGraphics.screen.height - touchMargin * 2,
      GameplayGraphics, 'any',
    );

    this.registerVolatileTouchScreenArea(this.pauseButtonTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.anyTouchScreenArea);

    this.createVirtualButton('pause', {
      keys: ['KeyP'],
      touchScreenAreas: ['pause'],
    });
    this.createVirtualButton('continue', {
      keys: ['Enter'],
      touchScreenAreas: ['any'],
    });
    this.createVirtualButton('left', {
      keys: ['ArrowLeft', 'KeyA'],
      touchScreenAreas: ['left'],
    });
    this.createVirtualButton('right', {
      keys: ['ArrowRight', 'KeyD'],
      touchScreenAreas: ['right'],
    });
    this.createVirtualButton('jump', {
      keys: ['Space'],
      touchScreenAreas: ['jump'],
    });

    // Init World
    this.demoWorld = new World(
      // [tileMaps.zone1, tileMaps.try, tileMaps.try2],
      [tileMaps.test],
      tilesets.world,
      0, 0,
    );

    // init triggerZoneCoords
    this.demoWorld.copyTileCoordsInBound(0, triggerZoneCoords.xTile, triggerZoneCoords.yTile, triggerZoneCoords);

    // Init Entities

    this.character = new Fexi();
    this.placeEntityOverTile(this.character, characterTilePositionX, characterTilePositionY);
    this.character.addHitbox(0.25, 0.3, 0.5, 0.7);

    this.character.die = () => {
      this.placeEntityOverTile(this.character, characterTilePositionX, characterTilePositionY);
      this.character.velocity.x = this.character.velocity.y = 0;
      this.resetAlpha = 1;
    };

    this.keySprite = new Sprite(resources.key, 1, [1], GameplayGraphics);
    this.key = new Entity(
      { normal: this.keySprite },
      { startingSpriteKey: 'normal' },
    );
    this.placeEntityOverTile(this.key, keyTilePositionX, keyTilePositionY);

    this.flagSprite = new Sprite(resources.flag, 1, [1], GameplayGraphics);
    this.flag = new Entity(
      { normal: this.flagSprite },
      { startingSpriteKey: 'normal' },
    );
    this.placeEntityOverTile(this.flag, flagTilePositionX, flagTilePositionY);

    this.water = new (class {
      constructor() {
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
      }

      render(customCamera) {
        GameplayRenderer.renderFullRectangle(
          0, this.position.y - customCamera.y,
          GameplayGraphics.screen.width, GameplayGraphics.screen.height, 'rgba(0, 0, 255, 0.5)',
        );
      }
    })();

    // _, 58
    this.resetWater = () => {
      this.demoWorld.copyTileCoordsInBound(0, waterTilePositionX, waterTilePositionY, this.water.position);
      this.water.velocity.y = 0;
    };
    this.resetWater();


    // init cameraFollowBox coords
    cameraFollowBox.x = this.character.position.x - (cameraFollowBox.width - this.character.width) / 2;
    cameraFollowBox.y = this.character.position.y - (cameraFollowBox.height - this.character.height);

    this.getFinalCameraX = () => cameraFollowBox.x - (screen.width - cameraFollowBox.width) / 2;
    this.getFinalCameraY = () => cameraFollowBox.y - (screen.height - cameraFollowBox.height) / 2;

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
    this.speechClosed = true;

    const boundForLightPosition = new Bound();
    this.demoWorld.copyTileCoordsInBound(0, 29, 22, boundForLightPosition);
    this.light = new Light(
      this.key.position.x + this.key.width / 2, this.key.position.y + this.key.height / 2,
      // boundForLightPosition.x, boundForLightPosition.y,
      // this.character.position.x + this.character.width / 2, this.character.position.y + this.character.height / 2,
      // this.character.width / 2 + 35,
      this.key.height / 2 + 10,
      255, 0, 255,
      1,
    );

    const panelWidth = resources.stars.width;
    const panelHeight = resources.stars.height;

    this.bossSprite = new Sprite(resources.boss, 1, [1], GameplayGraphics);

    this.boss = new Entity(
      { normal: this.bossSprite },
      { startingSpriteKey: 'normal' },
      730, 350 - this.bossSprite.height,
    );

    this.init = () => {};
    this.onScreenResize();

    // init camera
    // camera.x = -screen.width;
    camera.x = this.finalCameraX;
    camera.y = -GameplayGraphics.tileSize.h * 10; // 10 tiles above the surface
  }

  createBackground() {
    this.back = GameplayGraphics.renderingContext2D.createLinearGradient(0, 0, 0, GameplayGraphics.screen.height * GameplayGraphics.scale);
    this.back.addColorStop(0, '#333333');
    this.back.addColorStop(1, '#333366');
  }

  update(elapsedTime, now) {
    if (!pause) {
      this.updateLogic(elapsedTime, now);
    }
  }

  render() {
    const { screen } = GameplayGraphics;

    renderer.clearScreen();

    // Render background
    // TOCACHE

    GameplayGraphics.renderer.renderBitmap(resources.background, 0, 0, screen.width, screen.height);
    GameplayRenderer.fillStyle = this.back;
    // GameplayRenderer.fillStyle = 'black';
    // GameplayRenderer.renderFullRectangle();

    // Render stars
    // TOCACHE
    const xTimes = Math.ceil(screen.width / resources.stars.width);
    const yTimes = Math.ceil(screen.height / resources.stars.height);

    for (let j = 0; j < yTimes; ++j) {
      for (let i = 0; i < xTimes; ++i) {
        GameplayGraphics.renderer.renderBitmap(
          resources.stars, resources.stars.width * i - camera.x * starsParallax, resources.stars.height * j - camera.y * starsParallax,
        );
      }
    }

    this.demoWorld.render(camera);

    // TOCACHE
    this.speech.render(camera);
    // cameraFollowBox.render(camera);

    this.boss.render(camera);


    this.key.render(camera);
    this.flag.render(camera);
    this.light.render(camera);
    // GameplayRenderer.renderFullRectangle((this.light.x - camera.x) - 10, (this.light.y - camera.y) - 10, 20, 20, 'white');
    // GameplayRenderer.renderFullCircle(this.light.x - camera.x, this.light.y - camera.y, 5, 'white');

    // this.lights.forEach(l => l.render(camera));

    if (showGrid) {
      renderer.renderWorldTileGrid(this.demoWorld, camera, this.demoWorld.collisionInfo.map);
      this.character.render(camera);
      this.character.hitbox.render(camera, this.zoneIndex >= 0);
    } else {
      this.character.render(camera);
    }

    this.water.render(camera);

    // Render Curtain
    // TOCACHE
    const curtainHeight = screen.height * curtainHeightFactor * curtain;
    GameplayRenderer.fillStyle = 'black';
    GameplayRenderer.renderFullRectangle(0, 0, screen.width, curtainHeight);
    GameplayRenderer.renderFullRectangle(0, screen.height - curtainHeight, screen.width, curtainHeight);

    this.renderLogic();

    if (pause) {
      GameplayGraphics.renderingContext2D.globalAlpha = 0.75;
      GameplayGraphics.renderer.fillStyle = 'black';
      GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);
      GameplayGraphics.renderingContext2D.globalAlpha = 1;
      GameplayGraphics.renderer.renderString('PAUSE', (screen.width / 2) - ('pause'.length / 2) * 6, screen.height / 2 - 2.5, fonts.normal);
    }

    if (FexUtils.deviceHasTouch()) {
      this.pauseButton.render();
    }

    if (this.resetAlpha > 0) {
      GameplayRenderer.fillStyle = 'black';
      GameplayRenderer.alpha = this.resetAlpha;
      GameplayRenderer.renderFullRectangle();
      this.resetAlpha -= this.resetAlphaSpeed;
      GameplayRenderer.alpha = 1;
    }

    FexDebug.logOnScreen('zone indexes', JSON.stringify(this.demoWorld.zoneIndexes));
    FexDebug.logOnScreen('character velocity x', FexMath.precision(this.character.velocity.x));
    FexDebug.logOnScreen('character velocity y', FexMath.precision(this.character.velocity.y));
    FexDebug.logOnScreen('character pos x', this.character.position.x);
    FexDebug.logOnScreen('character pos y', this.character.position.y);
    FexDebug.logOnScreen('isInAir', this.demoWorld.collisionInfo.isInAir);
    // FexDebug.logOnScreen('cameraFollowBox x', cameraFollowBox.x);
    // FexDebug.logOnScreen('cameraFollowBox y', cameraFollowBox.y);
    // FexDebug.logOnScreen('slime pos from cam x', this.character.position.x - camera.x);
    // FexDebug.logOnScreen('slime pos from cam y', this.character.position.y - camera.y);
    // FexDebug.logOnScreen('hitbox pos from cam x', this.character.hitbox.getAbsoluteX() - camera.x);
    // FexDebug.logOnScreen('hitbox pos from cam y', this.character.hitbox.getAbsoluteY() - camera.y);

    // FexDebug.logOnScreen('hitbox pos x', FexMath.precision(this.character.hitbox.getAbsoluteX() + this.character.hitbox.absoluteWidth));
    // FexDebug.logOnScreen('hitbox pos y', FexMath.precision(this.character.hitbox.getAbsoluteY() + this.character.hitbox.absoluteHeight));
  }

  postUpdate() {
    if (this.inputRecovery) {
      this.fired = this.inputRecovery.fired;
      this.pressed = this.inputRecovery.pressed;
      this.released = this.inputRecovery.released;


      // eslint-disable-next-line no-restricted-syntax
      for (const key in this.released.keyboard) {
        // eslint-disable-next-line no-prototype-builtins
        if (this.released.keyboard.hasOwnProperty(key)) {
          this.released.keyboard[key]();
        }
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const area in this.released.touchScreen) {
        // eslint-disable-next-line no-prototype-builtins
        if (this.released.touchScreen.hasOwnProperty(area)) {
          this.released.touchScreen[area]();
        }
      }

      this.inputRecovery = null;
    }
  }

  onFocusLost() {
    if (pause) return;
    pause = true;
    this.pauseButton.changeSpriteTo('unpause');

    const previousInput = { fired: this.fired, pressed: this.pressed, released: this.released };
    this.clearInputState();

    this.leftButton.changeSpriteTo('normal');
    this.rightButton.changeSpriteTo('normal');
    this.jumpButton.changeSpriteTo('normal');

    this.onFired('pause', () => this.unpause(previousInput));
  }

  renderUI() {
    this.leftButton.render();
    this.rightButton.render();
    this.jumpButton.render();

    FexDebug.logOnScreen('pauseButton.y', this.pauseButton.position.y);
    FexDebug.logOnScreen('jumpButton.y', this.jumpButton.position.y);
  }

  updateCameraFollowBox() {
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

  modifyGravity(standardGravity) {
    const yRapidness = Math.abs(this.character.velocity.y);
    const factor = FexMath.precision((yRapidness / maxJumpVelocity) ** 0.25) || 1;
    return standardGravity * Math.max(0.5, factor);
  }

  normalUpdate(elapsedTime, now) {
    // FexDebug.chargeHeavily();
    FexDebug.logOnScreen('this.timeInAir', this.timeInAir);
    if (!pause) {
      curtain = Math.max(0, Math.min(1, curtain + curtainSpeed * elapsedTime));

      if (this.water.position.y > GameplayGraphics.tileSize.h) {
        this.water.position.y -= this.water.velocity.y;
      }

      this.character.velocity.y += this.modifyGravity(gravity) * elapsedTime;
      this.character.update(elapsedTime);

      // start moving water (trigger)
      if (this.water.velocity.y === 0
        && this.character.position.x < triggerZoneCoords.x
        && this.character.position.y < triggerZoneCoords.y) {
        this.water.velocity.y = waterVelocity;
      }

      // light update
      // this.light.x = this.character.position.x + this.character.width / 2;
      // this.light.y = this.character.position.y + this.character.height / 2;

      // this.lights.forEach((l, i) => {
      //   l.x = this.character.position.x + this.character.width / 2 + 10 * i;
      //   l.y = this.character.position.y + this.character.height / 2;
      // });

      this.createBackground();

      this.zoneIndex = this.demoWorld.getZoneIndex(this.character.hitbox);
      this.demoWorld.setCollisionInfo(this.character, elapsedTime);

      if (this.demoWorld.collisionInfo.dead) {
        this.character.die();
        this.resetWater();
        return;
      }

      if (this.character.position.y + this.character.height > this.water.position.y) {
        this.character.die();
        this.resetWater();
        return;
      }

      this.isInAir = this.demoWorld.collisionInfo.isInAir;
      if (this.isInAir) {
        this.timeInAir += elapsedTime;
      } else {
        this.timeInAir = 0;
        this.hasJumped = false;
        if (now - this.jumpRequestTime < prematureJumpTolerance) {
          this.jump();
          this.jumpRequestTime = null;
        }
      }

      FexDebug.logOnScreen('coyoteTime', `${coyoteTime}ms`);
      FexDebug.logOnScreen('prematureJumpTolerance', `${prematureJumpTolerance}ms`);

      const { friction } = this.demoWorld.collisionInfo;
      if (this.character.velocity.x !== 0) {
        const newRapidness = Math.max(0, Math.abs(this.character.velocity.x) - friction * elapsedTime);
        this.character.velocity.x = newRapidness * Math.sign(this.character.velocity.x);
      }

      this.speech.setBottomLeftCorner(this.character.position.x + 14, this.character.position.y);
      this.speech.update(elapsedTime);

      this.updateCameraFollowBox();
    }

    camera.x = artificialCameraOffsetX + Math.max(0, cameraFollowBox.x - (screen.width - cameraFollowBox.width) / 2);
    camera.y = artificialCameraOffsetY + Math.min(this.finalCameraY + 700, cameraFollowBox.y - (screen.height - cameraFollowBox.height) / 2);
  }

  idleUpdate(elapsedTime) {

  }

  initialCutSceneUpdate(elapsedTime) {
    curtain = Math.max(0, Math.min(1, curtain + curtainSpeed * elapsedTime));

    const cameraCutSceneSpeed = 0.05;
    camera.y = Math.min(camera.y + elapsedTime * cameraCutSceneSpeed, this.finalCameraY);

    if (camera.x === this.finalCameraX && camera.y === this.finalCameraY) {
      if (this.speechClosed) {
        this.speech.next();
        this.onFired('continue', () => {
          this.speech.next();
        });
        this.speechClosed = false;
      }

      this.speech.update(elapsedTime);

      if (this.speech.complete) {
        curtainSpeed *= -1;
        this.updateLogic = this.normalUpdate;
        this.normalInput();
        if (FexUtils.deviceHasTouch()) {
          this.renderLogic = this.renderUI;
        }
      }
    }
  }

  unpause(previousInput) {
    this.inputRecovery = previousInput;
    pause = false;
    this.pauseButton.changeSpriteTo('pause');
  }

  idleInput() {
    this.clearInputState();

    this.onFired('continue', () => {
      curtainSpeed = 0.003;
      this.speech.next();
      this.updateLogic = this.initialCutSceneUpdate;
      this.cutSceneInput();
    });
  }

  cutSceneInput() {
    this.clearInputState();
    this.onFired('pause', this.onFocusLost);
    this.onFired('continue', () => { camera.y = this.getFinalCameraY(); });
  }

  normalInput() {
    InputBuffer.deleteTouchScreenArea('any');
    this.registerVolatileTouchScreenArea(this.leftButtonTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.rightButtonTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.jumpButtonTouchScreenArea);

    this.clearInputState();
    this.onFired('pause', this.onFocusLost);

    this.pressed.keyboard.ArrowUp = () => {
      artificialCameraOffsetY -= 1;
    };
    this.pressed.keyboard.ArrowDown = () => {
      artificialCameraOffsetY += 1;
    };
    this.fired.keyboard.KeyG = () => {
      showGrid = !showGrid;
    };
    this.fired.keyboard.KeyK = () => {
      this.speech.next();
    };

    this.onPressed('left', this.moveLeft);
    this.onPressed('right', this.moveRight);

    this.onFired('left', () => {
      this.leftButton.changeSpriteTo('pressed');
    });
    this.onFired('right', () => {
      this.rightButton.changeSpriteTo('pressed');
    });
    this.onReleased('left', () => {
      this.character.changeSpriteTo('idle');
      this.leftButton.changeSpriteTo('normal');
    });
    this.onReleased('right', () => {
      this.character.changeSpriteTo('idle');
      this.rightButton.changeSpriteTo('normal');
    });

    this.fired.keyboard.KeyC = () => {
      if (curtainSpeed === 0) {
        curtainSpeed = 0.003;
      } else {
        curtainSpeed *= -1;
      }
    };

    this.onFired('jump', (deltaTime, now) => {
      this.jumpButton.changeSpriteTo('pressed');
      this.tryToJump(deltaTime, now);
    });

    this.fired.keyboard.KeyJ = this.jump;

    this.onReleased('jump', () => {
      this.jumpButton.changeSpriteTo('normal');
      this.interruptJumpingAcceleration();
    });
  }

  isInUIRegion(x, y, x0, y0) {
    return x > x0 && x < x0 + this.uiButtonSize && y > y0 && y < y0 + this.uiButtonSize;
  }

  moveRight(elapsedTime) {
    const { isInAir } = this.demoWorld.collisionInfo;
    // const useMaxAcceleration = isInAir && this.character.velocity.x < 0;
    const useMaxAcceleration = isInAir;
    this.character.changeSpriteTo('run');
    this.character.velocity.x = Math.min(
      maxMoveVelocity, this.character.velocity.x + getMoveAcceleration(useMaxAcceleration) * elapsedTime,
    );
  }

  moveLeft(elapsedTime) {
    const { isInAir } = this.demoWorld.collisionInfo;
    // const goMax = isInAir && this.character.velocity.x > 0;
    const useMaxAcceleration = isInAir;
    this.character.changeSpriteTo('runInverse');
    this.character.velocity.x = Math.max(
      -maxMoveVelocity, this.character.velocity.x - getMoveAcceleration(useMaxAcceleration) * elapsedTime,
    );
  }

  tryToJump(_, now) {
    if (!this.hasJumped && this.timeInAir < coyoteTime) {
      this.jump();
    } else {
      this.jumpRequestTime = now;
    }
  }

  jump() {
    this.character.velocity.y = -maxJumpVelocity;
    this.hasJumped = true;
  }

  interruptJumpingAcceleration() {
    this.character.velocity.y = Math.max(this.character.velocity.y * 0.4, this.character.velocity.y);
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
