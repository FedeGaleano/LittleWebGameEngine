import { renderTileMap } from '../engine/tilemap.js';
import { GameplayGraphics } from '../engine/rendering.js';

const exampleTileMap = {
  scanline: 10,
  data: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
    1, 1, 1, 0, 0, 1, 0, 0, 1, 1,
    1, 1, 1, 1, 0, 0, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ],
};

const exampleTileMap2 = {
  scanline: 10,
  data: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 1, 1, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ],
};

const exampleTileMap3 = {
  scanline: 10,
  data: [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 1, 0, 0, 0, 1, 1,
    0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ],
};

const exampleTileMap4 = {
  scanline: 10,
  data: [
    0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
};

const exampleTileMapList = [
  exampleTileMap4,
  exampleTileMap4,
  exampleTileMap4,
  exampleTileMap4,
];

class Zone {
  constructor(x, y, tileMap) {
    this.x = x;
    this.y = y;
    this.tileMap = tileMap;
    this.width = tileMap.scanline * GameplayGraphics.tileSize.w;
    this.height = (tileMap.data.length / tileMap.scanline) * GameplayGraphics.tileSize.h;
  }

  render(camera) {
    renderTileMap(this.tileMap, this.x - camera.x, this.y - camera.y);
  }
}

class World {
  constructor(tileMapList, xOffset) {
    this.zones = [];
    let x = xOffset || 0;
    tileMapList.forEach((tileMap) => {
      this.zones.push(new Zone(x, -50, tileMap));
      const width = tileMap.scanline * GameplayGraphics.tileSize.w;
      x += width;
    });
  }

  render(camera) {
    this.zones.forEach(zone => zone.render(camera));
  }
}

const exampleZone = new Zone(200, 0, exampleTileMap);
const exampleWorld = new World(exampleTileMapList, 200);

export {
  exampleZone,
  exampleWorld,
};
