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

const demoTileMap3 = {
  scanline: 11,
  data: [
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
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
  demoTileMap3,
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

    this.collisionInfo = Array(2).fill().map(() => ({
      validZone: false,
      tilesInfo: Array(9).fill().map(() => ({ x: null, y: null, tileMark: 0 })),
    }));
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

  getZoneIndexes(hitBox) {
    const indexes = [-1, -1];
    let collisionsFound = 0;

    for (let i = 0; i < this.zones.length; ++i) {
      const {
        x, y, width, height,
      } = this.zones[i];
      if (hitBox.collidesWithBound(x, y, width, height)) {
        indexes[collisionsFound++] = i;
      }
    }

    return indexes;

    // return this.zones.indexOf(({
    //   x: xZone, y: yZone, width, height,
    // }) => x > xZone && x < xZone + width && y > yZone && y < yZone + height);
  }

  clearCollisionInfo() {
    for (let i = 0; i < this.collisionInfo.length; ++i) {
      this.collisionInfo[i].validZone = false;
      for (let j = 0; j < this.collisionInfo[i].tilesInfo.length; ++j) {
        this.collisionInfo[i].tilesInfo[j].x = null;
        this.collisionInfo[i].tilesInfo[j].y = null;
        this.collisionInfo[i].tilesInfo[j].tileMark = 0;
      }
    }
  }

  getCollisionInfo(hitBox) {
    const { tileSize } = GameplayGraphics;

    // TOCACHE (probably I don't need to do this everytime)
    this.clearCollisionInfo();

    const zoneIndexes = this.getZoneIndexes(hitBox);

    for (let a = 0; a < zoneIndexes.length; ++a) {
      const zoneIndex = zoneIndexes[a];
      const validZone = zoneIndex >= 0;

      if (validZone) {
        this.collisionInfo[a].validZone = true;

        const {
          x: xZone, y: yZone, tilesInX, tilesInY,
        } = this.zones[zoneIndex];

        const xOffset = hitBox.getAbsoluteX() - xZone;
        const yOffset = hitBox.getAbsoluteY() - yZone;
        const xTileIndex = Math.floor(xOffset / tileSize.w);
        const yTileIndex = Math.floor(yOffset / tileSize.h);
        const { tileMap } = this.zones[zoneIndex];
        const tileMapData = tileMap.data;

        for (let j = yTileIndex; j < yTileIndex + 3; ++j) {
          for (let i = xTileIndex; i < xTileIndex + 3; ++i) {
            if (i >= 0 && j >= 0 && i < tilesInX && j < tilesInY) {
              const tileBoundX = xZone + i * tileSize.w;
              const tileBoundY = yZone + j * tileSize.h;
              const tileBoundWidth = tileSize.w;
              const tileBoundHeight = tileSize.h;

              const yRasterPos = j - yTileIndex;
              const xRasterPos = i - xTileIndex;
              const rasterPos = yRasterPos * 3 + xRasterPos;

              this.collisionInfo[a].tilesInfo[rasterPos].x = tileBoundX;
              this.collisionInfo[a].tilesInfo[rasterPos].y = tileBoundY;

              const tileValue = tileMapData[tileMap.scanline * yTileIndex + xTileIndex];

              if (tileValue > 0) {
                this.collisionInfo[a].tilesInfo[rasterPos].tileMark = 2;

                if (hitBox.collidesWithBound(tileBoundX, tileBoundY, tileBoundWidth, tileBoundHeight)) {
                  this.collisionInfo[a].tilesInfo[rasterPos].tileMark = 3;
                }
              } else {
                this.collisionInfo[a].tilesInfo[rasterPos].tileMark = 1;
              }
            }
          }
        }
      }
    }

    return this.collisionInfo;
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
