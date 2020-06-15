import { renderTileMap } from '../engine/tilemap.js';
import { GameplayGraphics } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';
import FexDebug from '../engine/debug.js';
import TileMark from '../engine/TileMark.js';
import FexMath from '../engine/utils/FexMath.js';

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
  scanline: 32,
  data: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ],
};

const demoTileMap3 = {
  scanline: 11,
  data: [
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
  ],
};

const demoTileMap4 = {
  scanline: 11,
  data: [
    0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1,
    0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
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
  demoTileMap4,
];

const tileFriction = {
  1: 0.0001,
};

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

    this.collisionCheckAreaInTiles = { width: 2, height: 2 };
    this.collisionCheckAreaInTiles.area = this.collisionCheckAreaInTiles.width * this.collisionCheckAreaInTiles.height;
    this.collisionInfo = Array(2).fill().map(() => ({
      validZone: false,
      tilesInfo: Array(this.collisionCheckAreaInTiles.area).fill().map(() => ({ x: null, y: null, tileMark: TileMark.Skipped })),
    }));

    this.zoneIndexes = [null, null];
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

  setZoneIndexes(hitBox) {
    this.zoneIndexes[0] = this.zoneIndexes[1] = null;
    let collisionsFound = 0;

    // TOOPTIMIZE: Not all zones need to be even iterated
    for (let i = 0; i < this.zones.length; ++i) {
      const {
        x, y, width, height,
      } = this.zones[i];
      if (hitBox.collidesWithBound(x, y, width, height)) {
        this.zoneIndexes[collisionsFound++] = i;
      }
    }

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

  getCollisionInfo(entity, elapsedTime) {
    const { hitbox, velocity } = entity;
    const { tileSize } = GameplayGraphics;

    // TOCACHE (probably I don't need to do this everytime)
    this.clearCollisionInfo();

    this.setZoneIndexes(hitbox);

    for (let a = 0; a < this.zoneIndexes.length; ++a) {
      const zoneIndex = this.zoneIndexes[a];
      const validZone = zoneIndex !== null;

      if (validZone) {
        this.collisionInfo[a].validZone = true;

        const {
          x: xZone, y: yZone, tilesInX, tilesInY,
        } = this.zones[zoneIndex];

        const xOffset = hitbox.getAbsoluteX() - xZone;
        const yOffset = hitbox.getAbsoluteY() - yZone;
        const xBaseTileIndex = Math.floor(xOffset / tileSize.w);
        const yBaseTileIndex = Math.floor(yOffset / tileSize.h);
        const { tileMap } = this.zones[zoneIndex];
        const tileMapData = tileMap.data;

        const areaWidth = this.collisionCheckAreaInTiles.width;
        const areaHeight = this.collisionCheckAreaInTiles.height;
        const iLimit = areaWidth - 1;
        const jLimit = areaHeight - 1;

        for (let j = 0; j <= jLimit; ++j) {
          for (let i = 0; i <= iLimit; ++i) {
            const forwardX = velocity.x >= 0;
            const forwardY = velocity.y >= 0;
            const xTileIndex = (iLimit * Number(!forwardX)) + (i * FexMath.signedBoolean(forwardX)) + xBaseTileIndex;
            const yTileIndex = (jLimit * Number(!forwardY)) + (j * FexMath.signedBoolean(forwardY)) + yBaseTileIndex;
            if (xTileIndex >= 0 && yTileIndex >= 0 && xTileIndex < tilesInX && yTileIndex < tilesInY) {
              const tileBoundX = FexMath.precision(xZone + xTileIndex * tileSize.w);
              const tileBoundY = FexMath.precision(yZone + yTileIndex * tileSize.h);
              const tileBoundWidth = tileSize.w;
              const tileBoundHeight = tileSize.h;

              const yRasterPos = yTileIndex - yBaseTileIndex;
              const xRasterPos = xTileIndex - xBaseTileIndex;
              const rasterPos = yRasterPos * areaWidth + xRasterPos;

              this.collisionInfo[a].tilesInfo[rasterPos].x = tileBoundX;
              this.collisionInfo[a].tilesInfo[rasterPos].y = tileBoundY;

              const tileValue = tileMapData[tileMap.scanline * yTileIndex + xTileIndex];

              this.collisionInfo[a].tilesInfo[rasterPos].tileMark = TileMark.Empty;
              if (tileValue > 0) {
                this.collisionInfo[a].tilesInfo[rasterPos].tileMark = TileMark.Occupied;

                if (hitbox.collidesWithBound(tileBoundX, tileBoundY, tileBoundWidth, tileBoundHeight)) {
                  const penetrationDepthY = hitbox.minkowskiDifference.y + (velocity.y > 0 && hitbox.minkowskiDifference.height);
                  const penetrationDepthX = hitbox.minkowskiDifference.x + (velocity.x > 0 && hitbox.minkowskiDifference.width);

                  const factorToReachYAxis = Math.abs(penetrationDepthX / velocity.x);
                  const factorToReachXAxis = Math.abs(penetrationDepthY / velocity.y);

                  if (factorToReachXAxis <= factorToReachYAxis) { // TODO: considerate equality case separatly and resolve in both axes
                    entity.position.y -= penetrationDepthY;
                    entity.velocity.y = 0;

                    if (entity.velocity.x !== 0) {
                      const newRapidness = Math.max(0, Math.abs(entity.velocity.x) - tileFriction[tileValue] * elapsedTime);
                      entity.velocity.x = newRapidness * Math.sign(entity.velocity.x);
                    }
                  } else if (factorToReachXAxis > factorToReachYAxis) {
                    entity.position.x -= penetrationDepthX;
                    entity.velocity.x = 0;
                  }

                  this.collisionInfo[a].tilesInfo[rasterPos].tileMark = TileMark.Collided;
                }
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
