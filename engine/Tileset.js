/* eslint-disable no-restricted-globals */
import { GameplayGraphics } from './rendering.js';
import FexDebug from './debug.js';
import Bound from './Bound.js';

class TileSet {
  constructor(metadata, resources) {
    this.bitmap = resources[metadata.name];
    this.tileWidth = metadata.tilewidth;
    this.tileHeight = metadata.tileheight;
    this.tileScanline = Math.floor(this.bitmap.width / this.tileWidth);
    this.count = metadata.tilecount;
    this.graphics = GameplayGraphics;

    this.collisionData = new Array(this.count).fill().map(() => new Bound());
    metadata.tiles
      .forEach(({ id, objectgroup: { objects } }) => {
        [this.collisionData[id]] = objects;
      });

    FexDebug.logOnConsole('worldTileSet.collisionData: ', this.collisionData);

    this.render = this.render.bind(this);
  }

  render(tileId, finalX, finalY) {
    if (tileId === 0) return;

    const tileIndex = tileId - 1;

    const sx = (tileIndex % this.tileScanline) * this.tileWidth;
    const sy = Math.floor(tileIndex / this.tileScanline) * this.tileWidth;

    this.graphics.renderer.renderSubBitmapNoRound(
      this.bitmap, finalX, finalY, sx, sy, this.tileWidth, this.tileHeight,
    );
  }

  fillHitboxAbsoluteBound(tileIndex, hitboxInfo) {
    const {
      x, y, width, height,
    } = this.collisionData[tileIndex];

    hitboxInfo.x = x;
    hitboxInfo.y = y;
    hitboxInfo.width = width;
    hitboxInfo.height = height;
  }
}

export default TileSet;
