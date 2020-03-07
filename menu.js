import { GameplayGraphics } from './engine/rendering.js';
import { resources } from './engine/resources.js';

const { renderer, screen } = GameplayGraphics;

function initialState() {
  renderer.fillStyle = '#1E1E1E';
  renderer.strokeStyle = '#00FFFF';
}

window.addEventListener('resize', initialState);

export default {
  init() {
    initialState();
  },
  update() {

  },
  render() {
    renderer.clearScreen();
    renderer.renderTileGrid();
    renderer.renderSprite(
      resources.titleImage,
      (screen.width - resources.titleImage.width) / 2,
      (screen.height - resources.titleImage.height) / 2,
    );
  },
  pressed: {},
  fired: {},
};
