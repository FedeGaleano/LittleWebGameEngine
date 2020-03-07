import { GameplayGraphics } from './rendering.js';

function exampleRenderTile(tileIndex, x, y) {
  if (tileIndex === 1) {
    const { w, h } = GameplayGraphics.tileSize;
    GameplayGraphics.renderer.fillStyle = 'green';
    GameplayGraphics.renderer.renderFullRectangle(x, y, w, h);
  }
}

const exampleMap = {
  scanline: 10,
  data: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
    0, 1, 0, 1, 0, 0, 1, 0, 1, 0,
    0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
};

function renderTileMap(tileMap, x, y) {
  const { scanline, data } = tileMap;
  const { w, h } = GameplayGraphics.tileSize;
  for (let i = 0; i < data.length; ++i) {
    exampleRenderTile(data[i], (i % scanline) * w + x, Math.floor(i / scanline) * h + y);
  }
}

const exampleRender = (x, y) => renderTileMap(exampleMap, x, y);


export {
  exampleRender,
  renderTileMap,
};
