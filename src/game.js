import { GameplayGraphics } from '../engine/rendering.js';
import Sprite from '../engine/sprite.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import { World, exampleTileMapList } from './world.js';

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
let exampleWorld = null;

export default {
  init() {
    initialState();
    sprite = new Sprite(resources.demo, 2, [15, 15], GameplayGraphics);
    exampleWorld = new World(exampleTileMapList, [0, resources.tile]);
  },
  update() {
    ++count;
    sprite.update();
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

    // Render Tiles
    exampleWorld.render({ x: 0, y: 0 });

    // for (let i = 0; i < 1000; ++i) {
    //   FexDebug.log('lolazo');
    // }

    // const centeredSpriteCoordinates = [
    //   (screen.width - sprite.width) / 2, (screen.height - sprite.height) / 2,
    // ];
    // sprite.render(...centeredSpriteCoordinates);
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
