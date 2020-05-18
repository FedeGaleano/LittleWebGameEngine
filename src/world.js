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
    this.tilesInX = tileMap.scanline;
    this.tilesInY = tileMap.data.length / tileMap.scanline;
    this.width = this.tilesInX * GameplayGraphics.tileSize.w;
    this.height = this.tilesInY * GameplayGraphics.tileSize.h;
  }

  render(camera) {
    renderTileMap(this.tileMap, this.tileSet, this.x - camera.x, this.y - camera.y);
  }
}

class World {
  constructor(tileMapList, tileSet, xOffset, yOffset) {
    this.zones = [];
    this.origin = { x: xOffset || 0, y: yOffset || 0 };
    let xZone = this.origin.x;

    tileMapList.forEach((tileMap) => {
      this.zones.push(new Zone(xZone, this.origin.y, tileMap, tileSet));
      const width = tileMap.scanline * GameplayGraphics.tileSize.w;
      xZone += width;
    });

    this.size = this.zones.map(({ width, height }) => ({ width, height }))
      .reduce((a, b) => ({ width: a.width + b.width, height: Math.max(a.height, b.height) }));
  }

  render(camera) {
    this.zones.forEach(zone => zone.render(camera));
  }

  getZoneIndex(hitBox) {
    let index = -1;

    index = -1;

    for (let i = 0; i < this.zones.length; ++i) {
      const {
        x, y, width, height,
      } = this.zones[i];
      if (hitBox.collidesWithBound(x, y, width, height)) {
        index = i;
      }
    }

    return index;

    // return this.zones.indexOf(({
    //   x: xZone, y: yZone, width, height,
    // }) => x > xZone && x < xZone + width && y > yZone && y < yZone + height);
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
