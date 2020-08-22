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
import FireWorks from '../entities/fireworks.js';
import CutScene from '../../engine/cutScene.js';
import FexGlobals from '../../engine/utils/FexGlobals.js';

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
const cameraCutSceneSpeed = 0.05;
const cameraShakingAmplitude = 2;
const cameraShakingVelocity = 0.2;
const artificialCameraOffsetX = 0;
const artificialCameraOffsetY = 0;
const starsParallax = 0.25;

let curtain = 0;
const curtainHeightFactor = 0.15;
let curtainSpeed = 0;
const maxCurtainSpeed = 0.003;
const dialogSpeed = 0.009;

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

const floorStart = 7;
const wallStart = 10;
const characterTilePositionX = 27;
const characterTilePositionY = 63;
const flagTilePositionX = 27;
const flagTilePositionY = 0;
const waterTilePositionX = 0;
const waterTilePositionY = 64;
const triggerZoneCoords = {
  // less than
  xTile: 18,
  yTile: 57,

  // these two are set in Game.init after world creation using the tile coords above
  x: null,
  y: null,
};
const checkpoint = { xTile: characterTilePositionX, yTile: characterTilePositionY };
const entranceTilePositionX = 28;
const entranceTileWidthX = 2;

const touchMargin = 10;

let won = false;

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

    // bind input methods
    this.input_idle = this.input_idle.bind(this);
    this.input_normal = this.input_normal.bind(this);
    this.input_intro = this.input_intro.bind(this);
    this.input_waterScene = this.input_waterScene.bind(this);

    // bind update methods
    this.update_idle = this.update_idle.bind(this);
    this.update_intro = this.update_intro.bind(this);
    this.update_normal = this.update_normal.bind(this);
    this.update_waterScene = this.update_waterScene.bind(this);

    this.cameraYPivot = null;
    this.waterSceneTriggerMoment = null;
    this.waterSceneTriggered = false;
    this.gameHasCameraControlX = true;
    this.gameHasCameraControlY = true;

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

    this.createBackground = this.createBackground.bind(this);
    this.decideGravity = this.modifyGravity.bind(this);

    this.blockGameplayInteraction = this.blockGameplayInteraction.bind(this);
    this.recoverInputInNextFrame = this.recoverInputInNextFrame.bind(this);

    this.leftButtonSprite = null;
    this.leftButtonPressedSprite = null;
    this.rightButtonSprite = null;
    this.rightButtonPressedSprite = null;
    this.jumpButtonSprite = null;
    this.jumpButtonPressedSprite = null;

    // Entities
    this.character = null;
    this.flag = null;
    this.water = null;
    this.arrow = null;
    this.fireworks = null;

    // UI
    this.leftButton = null;
    this.rightButton = null;
    this.jumpButton = null;
    this.pauseButton = null;

    // Others
    this.speech = null;
    this.demoWorld = null;
    this.starPanels = [];

    // Final camera coords
    this.getFinalCameraX = null;
    this.getFinalCameraY = null;
    this.finalCameraX = null;
    this.finalCameraY = null;

    this.resetAlpha = 0;
    this.resetAlphaSpeed = 0.05;

    this.winString = 'GANASTE. GRACIAS POR JUGAR :3';
    this.winStringLength = null;
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

    this.createBackground();

    this.demoWorld.preRender();
  }

  placeEntityOverTile(entity, xTile, yTile, zoneIndex = 0) {
    this.demoWorld.copyTileCoordsInBound(
      zoneIndex, xTile, yTile, entity.position,
    );
    entity.position.y -= entity.height;
    entity.position.y += floorStart;
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

    // virtual buttons
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
      keys: ['Space', 'ArrowUp', 'KeyW'],
      touchScreenAreas: ['jump'],
    });

    // Init World
    this.demoWorld = new World(
      // [tileMaps.zone1, tileMaps.try, tileMaps.try2],
      [tileMaps.demo],
      tilesets.world,
      0, 0,
    );

    this.demoWorld.preRender();

    // init triggerZoneCoords
    this.demoWorld.copyTileCoordsInBound(0, triggerZoneCoords.xTile, triggerZoneCoords.yTile, triggerZoneCoords);

    // Init Entities

    this.character = new Fexi();
    this.placeEntityOverTile(this.character, characterTilePositionX, characterTilePositionY);
    this.character.addHitbox(0.25, 0.3, 0.5, 0.7);

    this.character.die = () => {
      // this.placeEntityOverTile(this.character, characterTilePositionX, characterTilePositionY);
      this.placeEntityOverTile(this.character, checkpoint.xTile, checkpoint.yTile);
      this.character.velocity.x = this.character.velocity.y = 0;
      this.resetAlpha = 1;
    };

    this.flagSprite = new Sprite(resources.flag, 13, 50, GameplayGraphics);
    this.flag = new Entity(
      { normal: this.flagSprite },
      { startingSpriteKey: 'normal' },
    );
    this.placeEntityOverTile(this.flag, flagTilePositionX, flagTilePositionY);

    this.arrowSprite = new Sprite(resources.arrow, 2, [400, 400], GameplayGraphics);
    this.arrow = new Entity(
      { normal: this.arrowSprite },
      { startingSpriteKey: 'normal' }, 0, 0,
    );
    this.demoWorld.copyTileCoordsInBound(0, 21, 52, this.arrow.position);

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
      // this.water.velocity.y = 0;
      // this.cameraYPivot = null;
      // this.waterSceneTriggered = false;
      this.water.velocity.y = checkpoint.yTile === triggerZoneCoords.yTile ? waterVelocity : 0;
    };
    this.resetWater();
    this.water.velocity.y = 0;

    this.fireworks = new FireWorks();
    this.fireworks.position.y = -3 * GameplayGraphics.tileSize.h;

    // init cameraFollowBox coords
    cameraFollowBox.x = this.character.position.x - (cameraFollowBox.width - this.character.width) / 2;
    cameraFollowBox.y = this.character.position.y - (cameraFollowBox.height - this.character.height);

    this.getFinalCameraX = () => cameraFollowBox.x - (screen.width - cameraFollowBox.width) / 2;
    this.getFinalCameraY = () => cameraFollowBox.y - (screen.height - cameraFollowBox.height) / 2;

    const dialogPoint = { x: this.character.position.x + 14, y: this.character.position.y };
    this.speech = new Speech(dialogPoint.x, dialogPoint.y, [
      [
        'Hola, soy Fexi, la mascota',
        'del motor Fex Engine',
      ],
      [
        'seguramente Fex',
        'ya te explico',
        'que este no es',
        'el videojuego',
      ],
      [
        'pero aun asi',
        'sigues esperando eso',
        'porque el hype',
        'no te deja escuchar',
      ],
      [
        'asi que mientras tanto...',
      ],
      [
        'Ayudame a salir de aqui',
        'sin caer al agua',
      ],
      [
        ':)',
      ],
      [
        '<3',
      ],
    ], dialogSpeed);

    // to start idle
    // this.updateLogic = this.update_idle;
    // this.renderLogic = () => {};
    // this.input_idle();

    // to start with cutScene
    this.updateLogic = this.update_intro;
    this.renderLogic = () => {};
    this.input_intro();
    curtain = -500;
    curtainSpeed = maxCurtainSpeed;
    this.speechClosed = true;

    const boundForLightPosition = new Bound();
    this.demoWorld.copyTileCoordsInBound(0, 29, 22, boundForLightPosition);

    const panelWidth = resources.stars.width;
    const panelHeight = resources.stars.height;

    this.bossSprite = new Sprite(resources.boss, 1, [1], GameplayGraphics);

    this.boss = new Entity(
      { normal: this.bossSprite },
      { startingSpriteKey: 'normal' },
      730, 350 - this.bossSprite.height,
    );

    // this.init = () => {};
    this.onScreenResize();

    // init camera
    // camera.x = -screen.width;
    camera.x = this.finalCameraX;
    camera.y = -GameplayGraphics.tileSize.h * 10; // 10 tiles above the surface

    // init winString Length
    this.winStringLength = fonts.normal.measureText(this.winString);

    // Init Cutscenes
    const shakeCamera = {
      update: (elapsedTime) => {
        // shake camera
        let spd = cameraShakingAmplitude;
        if (camera.y >= this.cameraYPivot + cameraShakingAmplitude) {
          spd = -cameraShakingVelocity;
        }
        if (camera.y < this.cameraYPivot) {
          spd = cameraShakingVelocity;
        }

        camera.y = FexMath.boundExpression(camera.y + spd * elapsedTime, this.cameraYPivot, this.cameraYPivot + cameraShakingAmplitude);
      },
    };
    const fexiSaysOmg = {
      init: () => {
        this.character.secondSpeech = new Speech(
          this.character.position.x + this.character.width, this.character.position.y,
          [
            ['OMG'],
          ],
          dialogSpeed,
        );
      },
      update: (elapsedTime) => {
        if (this.character.secondSpeech.closed) {
          this.character.secondSpeech.next();
        }
      },
      finish: () => {
        this.character.secondSpeech.next();
      },
    };
    const startMovingCameraDown = {
      update: (elapsedTime) => {
        camera.y = Math.min(camera.y + cameraCutSceneSpeed * elapsedTime, this.cameraYPivot + 100);
      },
    };
    const startMovingWater = {
      init: () => {
        this.water.velocity.y = waterVelocity;
      },
    };
    const bringCameraBackToFexi = {
      update: (elapsedTime) => {
        camera.y = Math.max(camera.y - cameraCutSceneSpeed * 2 * elapsedTime, this.cameraYPivot);
      },
      forceFinishIf: () => camera.y === this.cameraYPivot,
    };
    this.waterCutScene = new CutScene();
    this.waterCutScene.onStart(() => {
      this.gameHasCameraControlY = false;
      checkpoint.xTile = triggerZoneCoords.xTile - 1;
      checkpoint.yTile = triggerZoneCoords.yTile;
      this.leftButton.changeSpriteTo('normal');
      this.rightButton.changeSpriteTo('normal');
      this.jumpButton.changeSpriteTo('normal');
      this.cameraYPivot = camera.y;
      curtainSpeed = maxCurtainSpeed;
      this.character.changeSpriteTo('idle');
    });
    this.waterCutScene.on(0, shakeCamera, 1000);
    this.waterCutScene.on(1500, fexiSaysOmg, 4000);
    this.waterCutScene.on(3000, startMovingCameraDown, 5500);
    this.waterCutScene.on(6000, startMovingWater, 6000);
    this.waterCutScene.on(6500, bringCameraBackToFexi, 8500);

    this.fexiRunsToWinPoint = {
      init: () => {
        this.jump();
      },
      update: (elapsedTime) => {
        this.moveLeft(elapsedTime);
      },
    };
    this.launchFireworks = {
      init: () => {
        this.fireworks.position.x = this.character.position.x + this.character.width / 2 - this.fireworks.width / 2;
        this.character.changeSpriteTo('idle');
        this.leftButton.changeSpriteTo('normal');
        this.rightButton.changeSpriteTo('normal');
        this.jumpButton.changeSpriteTo('normal');
      },
      update: (elapsedTime) => {
        this.fireworks.update(elapsedTime);
      },
      render: (camera) => {
        const x = (screen.width - this.winStringLength) / 2;
        const y = (screen.height - fonts.normal.cellHeight) / 2;
        GameplayRenderer.renderFullRectangle(x - 1, y - 1, this.winStringLength + 1, fonts.normal.cellHeight - 1, 'rgba(0, 0, 0, 0.75)');
        GameplayRenderer.renderStringColored(this.winString, x, y, fonts.normal, '#55FF00');
      },
    };
    this.winCutScene = new CutScene();
    this.winCutScene.onStart(() => {
      this.gameHasCameraControlY = false;
      this.clearInputState();
    });
  }

  createBackground() {
    this.back = GameplayGraphics.renderingContext2D.createLinearGradient(0, 0, 0, GameplayGraphics.screen.height * GameplayGraphics.scale);
    this.back.addColorStop(0, '#190a2c');
    this.back.addColorStop(1, '#4b2cb2');
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

    // GameplayGraphics.renderer.renderBitmap(resources.background, 0, 0, screen.width, screen.height);

    GameplayRenderer.fillStyle = this.back;
    GameplayRenderer.renderFullRectangle();

    // Render stars
    // TOCACHE
    const xTimes = Math.ceil(screen.width / resources.stars.width);
    const yTimes = Math.ceil(screen.height / resources.stars.height);

    const starsOffsetY = 50;
    for (let j = 0; j < yTimes; ++j) {
      for (let i = 0; i < xTimes; ++i) {
        GameplayGraphics.renderer.renderBitmap(
          resources.stars, resources.stars.width * i - camera.x * starsParallax, resources.stars.height * j - starsOffsetY - camera.y * starsParallax,
        );
      }
    }


    if (won) {
      this.fireworks.render(camera);
    }

    this.demoWorld.render(camera);

    this.arrow.render(camera);

    // TOCACHE
    this.speech.render(camera);
    if (this.character.secondSpeech) {
      this.character.secondSpeech.render(camera);
    }


    // this.boss.render(camera);

    this.flag.render(camera);

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

    if (this.resetAlpha > 0) {
      GameplayRenderer.fillStyle = 'black';
      GameplayRenderer.alpha = this.resetAlpha;
      GameplayRenderer.renderFullRectangle();
      this.resetAlpha -= this.resetAlphaSpeed;
      GameplayRenderer.alpha = 1;
    }

    this.waterCutScene.render(camera);
    this.winCutScene.render(camera);

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

    FexDebug.logOnScreen('velocity fixed', `<${
      Number.parseFloat(FexMath.precision(this.character.velocity.x)).toFixed(2)
    }, ${
      Number.parseFloat(FexMath.precision(this.character.velocity.y)).toFixed(2)
    }>`);
    FexDebug.logOnScreen('position fixed', `<${
      Number.parseFloat(FexMath.precision(this.character.position.x)).toFixed(2)
    }, ${
      Number.parseFloat(FexMath.precision(this.character.position.y)).toFixed(2)
    }>`);
    FexDebug.logOnScreen('isInAir', this.demoWorld.collisionInfo.isInAir);
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

  blockGameplayInteraction() {
    const previousInput = { fired: this.fired, pressed: this.pressed, released: this.released };
    this.clearInputState();
    return previousInput;
  }

  onFocusLost() {
    if (pause) return;
    pause = true;
    this.pauseButton.changeSpriteTo('unpause');

    const previousInput = this.blockGameplayInteraction();
    this.onFired('pause', () => this.unpause(previousInput));

    this.leftButton.changeSpriteTo('normal');
    this.rightButton.changeSpriteTo('normal');
    this.jumpButton.changeSpriteTo('normal');
  }

  renderUI() {
    this.leftButton.render();
    this.rightButton.render();
    this.jumpButton.render();
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

  // eslint-disable-next-line camelcase
  update_normal(elapsedTime, now) {
    // FexDebug.chargeHeavily();
    FexDebug.logOnScreen('timeInAir', this.timeInAir);
    if (!pause) {
      curtain = Math.max(0, Math.min(1, curtain + curtainSpeed * elapsedTime));

      if (this.water.position.y > GameplayGraphics.tileSize.h) {
        this.water.position.y -= this.water.velocity.y;
      }

      this.character.velocity.y += this.modifyGravity(gravity) * elapsedTime;
      this.character.update(elapsedTime);

      this.arrow.update(elapsedTime);
      this.flag.update(elapsedTime);

      // start moving water (trigger)
      if (!this.waterSceneTriggered && this.cameraYPivot == null
        && this.character.position.x + this.character.hitbox.xOffset < triggerZoneCoords.x
        && this.character.position.y + this.character.height < triggerZoneCoords.y
      ) {
        this.waterCutScene.start();

        const prevInput = this.blockGameplayInteraction();

        this.waterCutScene.onFinish(() => {
          this.gameHasCameraControlY = true;
          this.recoverInputInNextFrame(prevInput);
          this.waterSceneTriggered = true;
          curtainSpeed *= -1;
        });
      }

      // check win condition
      if (!won && this.character.position.y + this.character.height - (4 /* temp security range */) <= 0 + floorStart
        && (
          this.character.position.x < entranceTilePositionX * GameplayGraphics.tileSize.w + wallStart
          || this.character.position.x + this.character.width > (entranceTilePositionX + entranceTileWidthX) * GameplayGraphics.tileSize.w + wallStart
        )
      ) {
        won = true;
        const time = this.character.velocity.x <= 0 ? 400 : 1000;
        this.winCutScene.on(0, this.fexiRunsToWinPoint, time);
        this.winCutScene.on(time, this.launchFireworks, Infinity);
        this.winCutScene.start();
      }

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
      if (this.character.secondSpeech) {
        this.character.secondSpeech.update(elapsedTime);
      }

      this.updateCameraFollowBox();

      // update cutscenes
      this.waterCutScene.update(elapsedTime);
      this.winCutScene.update(elapsedTime);
    }

    if (this.gameHasCameraControlX) {
      camera.x = artificialCameraOffsetX + Math.max(0, cameraFollowBox.x - (screen.width - cameraFollowBox.width) / 2);
    }
    if (this.gameHasCameraControlY) {
      camera.y = artificialCameraOffsetY + Math.min(this.finalCameraY + 700, cameraFollowBox.y - (screen.height - cameraFollowBox.height) / 2);
    }
  }

  // eslint-disable-next-line camelcase
  update_idle(elapsedTime) {

  }

  // eslint-disable-next-line camelcase
  update_intro(elapsedTime) {
    curtain = Math.max(0, Math.min(1, curtain + curtainSpeed * elapsedTime));

    camera.y = Math.min(camera.y + elapsedTime * cameraCutSceneSpeed, this.finalCameraY);
    camera.x = this.finalCameraX;
    this.flag.update(elapsedTime);

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
        this.updateLogic = this.update_normal;
        this.input_normal();
        if (FexUtils.deviceHasTouch()) {
          this.renderLogic = this.renderUI;
        }
      }
    }
  }

  // eslint-disable-next-line camelcase
  input_waterScene() {

  }

  // eslint-disable-next-line camelcase
  update_waterScene(elapsedTime, now) {

  }

  recoverInputInNextFrame(inputState) {
    this.inputRecovery = inputState;
  }

  unpause(previousInput) {
    this.recoverInputInNextFrame(previousInput);
    pause = false;
    this.pauseButton.changeSpriteTo('pause');
  }

  // eslint-disable-next-line camelcase
  input_idle() {
    this.clearInputState();

    this.onFired('continue', () => {
      curtainSpeed = maxCurtainSpeed;
      this.speech.next();
      this.updateLogic = this.update_intro;
      this.input_intro();
    });
  }

  // eslint-disable-next-line camelcase
  input_intro() {
    this.clearInputState();
    this.onFired('pause', this.onFocusLost);
    this.onFired('continue', () => { camera.y = this.getFinalCameraY(); });
  }

  // eslint-disable-next-line camelcase
  input_normal() {
    InputBuffer.deleteTouchScreenArea('any');
    this.registerVolatileTouchScreenArea(this.leftButtonTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.rightButtonTouchScreenArea);
    this.registerVolatileTouchScreenArea(this.jumpButtonTouchScreenArea);

    this.clearInputState();
    this.onFired('pause', this.onFocusLost);

    // this.pressed.keyboard.ArrowUp = () => {
    //   artificialCameraOffsetY -= 1;
    // };
    // this.pressed.keyboard.ArrowDown = () => {
    //   artificialCameraOffsetY += 1;
    // };
    this.fired.keyboard.KeyG = () => {
      if (FexGlobals.useDebugCommands.get()) {
        showGrid = !showGrid;
      }
    };
    // this.fired.keyboard.KeyK = () => {
    //   this.speech.next();
    // };

    // this.fired.keyboard.KeyR = () => {
    //   FexDebug.logOnConsole('reload call');
    //   this.init();
    // };

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

    // this.fired.keyboard.KeyC = () => {
    //   if (curtainSpeed === 0) {
    //     curtainSpeed = maxCurtainSpeed;
    //   } else {
    //     curtainSpeed *= -1;
    //   }
    // };

    this.onFired('jump', (deltaTime, now) => {
      this.jumpButton.changeSpriteTo('pressed');
      this.tryToJump(deltaTime, now);
    });

    // this.fired.keyboard.KeyJ = this.jump;

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
