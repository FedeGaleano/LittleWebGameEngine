import { GameplayGraphics } from '../engine/rendering.js';
import Sprite from '../engine/sprite.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import { World, exampleTileMapList, demoTileMapList } from './world.js';
import Entity from '../engine/entity.js';
import WordBubble from '../engine/wordBubble.js';
import Dialog from '../engine/dialog.js';
import Speech from '../engine/speech.js';

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

let count;

function initialState() {
  renderer.fillStyle = 'orange';
  renderer.strokeStyle = '#00FFFF';
  count = 0;
}

window.addEventListener('resize', initialState);
const camera = { x: 0, y: 0 };

let sprite = null;
let character = null;
let speech = null;
// let exampleWorld = null;
let demoWorld = null;
const numberOfTilesInTheFloorX = 7;
const numberOfTilesInTheFloorY = 1;

let pause = false;

const game = {
  init() {
    initialState();
    game.normalInput();
    sprite = new Sprite(resources.character, 1, [1], GameplayGraphics);
    character = new Entity(sprite, GameplayGraphics.tileSize.w * 3, -sprite.height);
    const dialogPoint = { x: character.x + 14, y: character.y };
    const dialogSpeed = 0.15;
    speech = new Speech(dialogPoint.x, dialogPoint.y, [
      [
        'este es',
        'un',
        'dialogo',
      ],
      [
        'este es',
        'un segundo',
        'dialogo',
      ],
      [
        'y por ultimo aqui',
        'tenemos otro dialogo',
        'mas xd',
      ],
    ], dialogSpeed);

    // exampleWorld = new World(exampleTileMapList, [0, resources.tile], 10, 50);
    demoWorld = new World(
      demoTileMapList,
      [0, resources.tile], 0, 0,
    );
  },
  update() {
    if (!pause) {
      ++count;
      FexDebug.logOnScreen('count', count);
      character.update();
      speech.update();
    }

    camera.x = -(screen.width / 2 - (numberOfTilesInTheFloorX / 2) * GameplayGraphics.tileSize.w);
    camera.y = -(screen.height / 2 - (numberOfTilesInTheFloorY / 2) * GameplayGraphics.tileSize.h);
  },
  render() {
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

    demoWorld.render(camera);
    character.render(camera);
    speech.render(camera);
    if (showGrid) {
      renderer.renderTileGrid();
    }
    if (pause) {
      GameplayGraphics.renderingContext2D.globalAlpha = 0.75;
      GameplayGraphics.renderer.fillStyle = 'black';
      GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);
      GameplayGraphics.renderingContext2D.globalAlpha = 1;
      GameplayGraphics.renderer.renderString('pause', (screen.width / 2) - ('pause'.length / 2) * 6, screen.height / 2 - 2.5, resources.font);
    }
  },
  onFocusLost() {
    pause = true;
    game.fired = {
      KeyP() {
        game.normalInput();
        pause = false;
      },
      KeyD() {

      },
      KeyK() {

      },
      ScreenTouch() {
        game.normalInput();
        pause = false;
      },
    };
  },
  normalInput() {
    game.fired = {
      KeyP() {
        game.onFocusLost();
      },
      KeyD() {
        showGrid = !showGrid;
      },
      KeyK() {
        speech.next();
      },
      ScreenTouch() {
        speech.next();
      },
      KeyC() {
        FexDebug.logOnScreen('camera.x', camera.x);
        FexDebug.logOnScreen('camera.y', camera.y);
      },
    };
  },
};

export default game;
