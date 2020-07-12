import { GameplayGraphics } from './rendering.js';

class TileSet {
  constructor(metadata, resources) {
    this.bitmap = resources[metadata.name];
    this.tileWidth = metadata.tilewidth;
    this.tileHieght = metadata.tileheight;
    this.tileScanline = Math.floor(this.bitmap.width / this.tileWidth);
    this.render = this.render.bind(this);
  }

  render(tileId, finalX, finalY) {
    if (tileId === 0) return;

    const tileIndex = tileId - 1;

    const sx = (tileIndex % this.tileScanline) * this.tileWidth;
    const sy = Math.floor(tileIndex / this.tileScanline) * this.tileWidth;

    GameplayGraphics.renderer.renderSubBitmap(
      this.bitmap, finalX, finalY, sx, sy, this.tileWidth, this.tileHieght,
    );
  }
}

export default TileSet;
