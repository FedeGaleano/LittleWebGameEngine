import { GameplayGraphics } from '../engine/rendering.js';
import Sprite from '../engine/sprite.js';
import { resources } from '../engine/resources.js';

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

export default {
  init() {
    initialState();
    sprite = new Sprite(resources.demo, 2, [15, 15], GameplayGraphics);
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
    const centeredSpriteCoordinates = [
      (screen.width - sprite.width) / 2, (screen.height - sprite.height) / 2,
    ];
    sprite.render(...centeredSpriteCoordinates);
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
