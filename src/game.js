import { GameplayGraphics } from '../engine/rendering.js';
import Hero from './hero.js';
import { exampleRender } from '../engine/tilemap.js';
import { exampleZone, exampleWorld } from './world.js';

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
const enemies = [];

function initialState() {
  renderer.fillStyle = 'orange';
  renderer.strokeStyle = '#00FFFF';
  count = 0;
}

window.addEventListener('resize', initialState);

const hero0 = new Hero(0.47);
const hero1 = new Hero(0.5, undefined, 0.1, undefined);
const hero2 = new Hero(undefined, 20, 2);
const hero = hero0;

class Enemy {
  constructor(x = GameplayGraphics.screen.width, y = 0, up = false) {
    this.x = x;
    this.y = y;
    this.up = up;
    this.width = Enemy.size.width;
    this.height = Enemy.size.height;
  }

  static get size() {
    return { width: GameplayGraphics.tileSize.w, height: GameplayGraphics.tileSize.h };
  }
}


const defaultValue = undefined;

function renderEnemy({ x, y, up = false }) {
  renderer.fillStyle = 'red';
  renderer.renderFullRectangle(x, y - up * Enemy.size.height, Enemy.size.width, Enemy.size.height * 2);
}

let up = false;
const offset = 0;
const camera = { x: 0, y: 0 };

export default {
  init() {
    initialState();
  },
  update() {
    hero.update();

    const lapse = 55;
    if (count % lapse === 0) {
      up = !up;

      enemies.push(new Enemy(
        // defaultValue, GameplayGraphics.tileSize.h * Math.round(Math.random() * (GameplayGraphics.screen.height / GameplayGraphics.tileSize.h)),
        // defaultValue, GameplayGraphics.tileSize.h * (Math.round(count / lapse / 2) % 2 === 0 ? 3 : 5),
        defaultValue, GameplayGraphics.tileSize.h * 3, up,
      ));
    }

    enemies.forEach((e) => { e.x--; });
    enemies.removeIf(e => e.x + Enemy.size.width < 0);

    // // Temporal pseudo-collision with screen's bottom bound
    // if (hero.y > screen.height - hero.height) {
    //   hero.y = screen.height - hero.height;
    //   hero.velocityVector = 0;
    // }

    const speed = 1;
    const cameraGap = 5;

    hero.x += speed;
    camera.x += speed;
    if (hero.y - camera.y < cameraGap) {
      camera.y = hero.y - cameraGap;
    }

    if (camera.y + screen.height - (hero.y + hero.height) < cameraGap) {
      camera.y = hero.y + hero.height + cameraGap - screen.height;
    }

    ++count;
  },
  render() {
    renderer.clearScreen();
    if (showGrid) {
      renderer.renderTileGrid();
    }
    // renderer.renderFullRectangle(0, Enemy.size.height, GameplayGraphics.screen.width, Enemy.size.height);
    // renderer.renderFullRectangle(0, Enemy.size.height * 5, GameplayGraphics.screen.width, Enemy.size.height);
    // enemies.forEach(renderEnemy);
    // exampleRender(offset, offset -= 0.25);
    // exampleZone.render(camera);
    exampleWorld.render(camera);
    hero.render(camera);


    const { renderingContext2D, canvasHeight } = GameplayGraphics;
    const prevColor = renderingContext2D.fillStyle;
    renderingContext2D.fillStyle = 'yellow';
    const fontSize = 18;
    renderingContext2D.font = `bold ${fontSize}px arial`;
    renderingContext2D.fillText(`camera: { ${camera.x}, ${camera.y} }`, 10, 20, 160);
    renderingContext2D.fillStyle = prevColor;
  },
  pressed: {
    Space() {
      hero.propulse();
    },
    ScreenTouch() {
      hero.propulse();
    },
  },
  released: {
    Space() {
      hero.fall();
    },
    ScreenTouch() {
      hero.fall();
    },
  },
  fired: {
    KeyD() {
      showGrid = !showGrid;
    },
  },
};
