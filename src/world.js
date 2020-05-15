import { renderTileMap } from '../engine/tilemap.js';
import { GameplayGraphics } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';

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

const demoTileMap = {
  scanline: 7,
  data: [
    1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ],
};

const demoTileMap2 = {
  scanline: 8,
  data: [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 1, 1, 0, 1,
    0, 1, 1, 1, 1, 1, 1, 1,
  ],
};

const exampleTileMapList = [
  exampleTileMap,
  exampleTileMap2,
  exampleTileMap3,
  exampleTileMap4,
];

const demoTileMapList = [
  demoTileMap,
  demoTileMap2,
];

class Zone {
  constructor(x, y, tileMap, tileSet) {
    this.x = x;
    this.y = y;
    this.tileMap = tileMap;
    this.tileSet = tileSet;
    this.width = tileMap.scanline * GameplayGraphics.tileSize.w;
    this.height = (tileMap.data.length / tileMap.scanline) * GameplayGraphics.tileSize.h;
  }

  render(camera) {
    renderTileMap(this.tileMap, this.tileSet, this.x - camera.x, this.y - camera.y);
  }
}

class World {
  constructor(tileMapList, tileSet, xOffset, yOffset) {
    this.zones = [];
    let x = xOffset || 0;
    const y = yOffset || 0;
    this.origin = { x, y };
    this.size = {
      width: tileMapList.map(tileMap => tileMap.scanline * GameplayGraphics.tileSize.w).reduce((a, b) => a + b),
      height: tileMapList.map(tileMap => (tileMap.data.length / tileMap.scanline) * GameplayGraphics.tileSize.h).reduce((a, b) => a + b),
    };
    tileMapList.forEach((tileMap) => {
      this.zones.push(new Zone(x, y, tileMap, tileSet));
      const width = tileMap.scanline * GameplayGraphics.tileSize.w;
      x += width;
    });
  }

  render(camera) {
    this.zones.forEach(zone => zone.render(camera));
  }
}

const exampleZone = new Zone(200, 0, exampleTileMap, [0, resources.tile]);
const exampleWorld = new World(exampleTileMapList, [0, resources.tile], 200);

export {
  exampleTileMapList,
  demoTileMapList,
  Zone,
  World,
};
