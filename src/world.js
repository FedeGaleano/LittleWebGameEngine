import { GameplayGraphics } from '../engine/rendering.js';
import TileMark from '../engine/TileMark.js';
import FexMath from '../engine/utils/FexMath.js';

const renderingOptimizationLevel = 2;

const defaultFriction = 0.00015;
const tileFriction = tileValue => ({
  1: 0.00015,
  2: 0.00015,
  3: 0.00015,
}[tileValue]) || defaultFriction;

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
    const x = this.x - camera.x;
    const y = this.y - camera.y;

    const { width: screeenWidth, height: screeenHeight } = GameplayGraphics.screen;

    if (renderingOptimizationLevel > 0
      && (x > screeenWidth || x + this.width < 0 || y > screeenHeight || y + this.height < 0)
    ) return;

    const { scanline, data } = this.tileMap;
    const { w, h } = GameplayGraphics.tileSize;
    for (let i = 0; i < data.length; ++i) {
      const finalX = (i % scanline) * w + x;
      const finalY = Math.floor(i / scanline) * h + y;

      if (renderingOptimizationLevel > 1
        && (finalX > screeenWidth || finalX + w < 0 || finalY > screeenHeight || finalY + h < 0)
      ) continue;

      this.tileSet.render(data[i], finalX, finalY);
    }
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
    this.airFriction = 0.00005;
    this.collisionInfo = {
      isInAir: false,
      friction: this.airFriction,
      map: Array(2).fill().map(() => ({
        validZone: false,
        tilesInfo: Array(this.collisionCheckAreaInTiles.area).fill().map(() => ({ x: null, y: null, tileMark: TileMark.Skipped })),
      })),
    };

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
  }

  clearCollisionMap() {
    this.collisionInfo.isInAir = true;
    this.collisionInfo.friction = this.airFriction;
    const { map } = this.collisionInfo;
    for (let i = 0; i < map.length; ++i) {
      map[i].validZone = false;
      for (let j = 0; j < map[i].tilesInfo.length; ++j) {
        map[i].tilesInfo[j].x = null;
        map[i].tilesInfo[j].y = null;
        map[i].tilesInfo[j].tileMark = 0;
      }
    }
  }

  setCollisionInfo(entity, elapsedTime) {
    const { hitbox, velocity } = entity;
    const { tileSize } = GameplayGraphics;

    // TOCACHE (probably I don't need to do this everytime)
    this.clearCollisionMap();

    const { map } = this.collisionInfo;

    this.setZoneIndexes(hitbox);

    for (let a = 0; a < this.zoneIndexes.length; ++a) {
      const zoneIndex = this.zoneIndexes[a];
      const validZone = zoneIndex !== null;

      if (validZone) {
        map[a].validZone = true;

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

              map[a].tilesInfo[rasterPos].x = tileBoundX;
              map[a].tilesInfo[rasterPos].y = tileBoundY;

              const tileValue = tileMapData[tileMap.scanline * yTileIndex + xTileIndex];

              map[a].tilesInfo[rasterPos].tileMark = TileMark.Empty;
              if (tileValue > 0) {
                map[a].tilesInfo[rasterPos].tileMark = TileMark.Occupied;

                if (hitbox.collidesWithBound(tileBoundX, tileBoundY, tileBoundWidth, tileBoundHeight)) {
                  const penetrationDepthY = hitbox.minkowskiDifference.y + (velocity.y > 0 && hitbox.minkowskiDifference.height);
                  const penetrationDepthX = hitbox.minkowskiDifference.x + (velocity.x > 0 && hitbox.minkowskiDifference.width);

                  const factorToReachYAxis = Math.abs(penetrationDepthX / velocity.x);
                  const factorToReachXAxis = Math.abs(penetrationDepthY / velocity.y);
                  if (factorToReachXAxis <= factorToReachYAxis) { // TODO: considerate equality case separatly and resolve in both axes
                    entity.position.y -= penetrationDepthY;
                    entity.velocity.y = 0;
                    this.collisionInfo.isInAir = false;
                    this.collisionInfo.friction = tileFriction(tileValue);
                  } else if (factorToReachXAxis > factorToReachYAxis) {
                    entity.position.x -= penetrationDepthX;
                    entity.velocity.x = 0;
                  }

                  map[a].tilesInfo[rasterPos].tileMark = TileMark.Collided;
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

export { Zone, World };
