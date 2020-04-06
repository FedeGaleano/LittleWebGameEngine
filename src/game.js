import { GameplayGraphics } from '../engine/rendering.js';
import Sprite from '../engine/sprite.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import { World, exampleTileMapList, demoTileMapList } from './world.js';
import Entity from '../engine/entity.js';

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
// let exampleWorld = null;
let demoWorld = null;
const numberOfTilesInTheFloorX = 7;
const numberOfTilesInTheFloorY = 1;

export default {
  init() {
    initialState();
    sprite = new Sprite(resources.character, 1, [1], GameplayGraphics);
    character = new Entity(sprite, GameplayGraphics.tileSize.w * 3, -sprite.height);
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

    GameplayGraphics.renderer.fillStyle = 'white';
    GameplayGraphics.renderer.renderFullRectangle(character.x + 14 - camera.x, character.y - 30 - camera.y, 100, 30);
    // GameplayGraphics.renderer.renderBitmap(resources.font, 120 + 2, 5 + 2);
    // GameplayGraphics.renderer.renderLetter('1', 120 + 2, 5 + 2, resources.font);
    // GameplayGraphics.renderer.renderString(`count: ${count}`, 120 + 2, 5 + 2, resources.font);
    GameplayGraphics.renderer.renderString('preparanding'.substring(0, count / 5), character.x + 14 + 2 - camera.x, character.y - 30 - camera.y + 2, resources.font);
    GameplayGraphics.renderer.renderString('la demo'.substring(0, (count / 5) - 'preparanding'.length),
      character.x + 14 + 2 - camera.x, character.y - 30 - camera.y + 6 + 2 + 2, resources.font);
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
