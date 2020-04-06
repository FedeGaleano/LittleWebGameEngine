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

const exampleTileMapList = [
  exampleTileMap,
  exampleTileMap2,
  exampleTileMap3,
  exampleTileMap4,
];

const demoTileMapList = [
  demoTileMap,
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
