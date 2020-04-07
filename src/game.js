import { GameplayGraphics } from '../engine/rendering.js';
import Sprite from '../engine/sprite.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import { World, exampleTileMapList, demoTileMapList } from './world.js';
import Entity from '../engine/entity.js';
import WordBubble from '../engine/wordBubble.js';
import Dialog from '../engine/dialog.js';

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
let dialog = null;
// let exampleWorld = null;
let demoWorld = null;
const numberOfTilesInTheFloorX = 7;
const numberOfTilesInTheFloorY = 1;

export default {
  init() {
    initialState();
    sprite = new Sprite(resources.character, 1, [1], GameplayGraphics);
    character = new Entity(sprite, GameplayGraphics.tileSize.w * 3, -sprite.height);
    dialog = new Dialog(character.x + 14, character.y, ['bida', 'lolazo', 'de una', 'xd'], 0.15);
    // exampleWorld = new World(exampleTileMapList, [0, resources.tile], 10, 50);
    demoWorld = new World(
      demoTileMapList,
      [0, resources.tile], 0, 0,
    );
  },
  update() {
    ++count;
    // sprite.update();
    character.update();
    camera.x = -(screen.width / 2 - (numberOfTilesInTheFloorX / 2) * GameplayGraphics.tileSize.w);
    camera.y = -(screen.height / 2 - (numberOfTilesInTheFloorY / 2) * GameplayGraphics.tileSize.h);
    dialog.update();
  },
  render() {
    renderer.clearScreen();
    if (showGrid) {
      renderer.renderTileGrid();
    }

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

    // GameplayGraphics.renderer.fillStyle = 'white';
    // GameplayGraphics.renderer.renderFullRectangle(character.x + 14 - camera.x, character.y - 30 - camera.y, 100, 30);

    // GameplayGraphics.renderer.renderBitmap(resources.wordBubble, character.x + 14 - camera.x, character.y - 30 - camera.y);

    // const point = { x: character.x + 14, y: character.y - 30 };
    // GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x - camera.x, point.y - camera.y, 0, 0, 3, 3);
    // GameplayGraphics.renderer.renderSubBitmap(resources.wordBubbleParts, point.x + 4 - camera.x, point.y - camera.y, 3, 0, 3, 3);
    // bubble.render(camera);
    dialog.render(camera);

    // GameplayGraphics.renderer.renderString('hola'.substring(0, count / 5), character.x + 14 + 3 - camera.x, character.y - 30 - camera.y + 3, resources.font);
    // GameplayGraphics.renderer.renderString('mundo'.substring(0, (count / 5) - 'hola'.length),
    //   character.x + 14 + 3 - camera.x, character.y - 30 - camera.y + 6 + 3 + 2, resources.font);
  },
  pressed: {
  },
  released: {
  },
  fired: {
    KeyD() {
      showGrid = !showGrid;
    },
  },
};
