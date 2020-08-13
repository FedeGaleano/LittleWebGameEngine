import { GameplayGraphics } from '../engine/rendering.js';
import TileMark from '../engine/TileMark.js';
import FexMath from '../engine/utils/FexMath.js';
import Bound from '../engine/Bound.js';
import Graphics from '../engine/graphics.js';
import FexGlobals from '../engine/utils/FexGlobals.js';

const defaultFriction = 0.0005;
const tileFriction = tileValue => ({
  1: defaultFriction,
  2: defaultFriction,
  3: defaultFriction,
}[tileValue]) || defaultFriction;

class ZoneGraphics extends Graphics {
  rescale() {
    this.scale = GameplayGraphics.scale;
  }
}

class Zone {
  constructor(x, y, tileMap, tileSet) {
    this.x = x;
    this.y = y;
    this.tileMap = tileMap;
    this.tileSet = tileSet;
    this.tilesInX = tileMap.scanline;
    this.tilesInY = tileMap.layers[0].length / tileMap.scanline;
    this.width = this.tilesInX * GameplayGraphics.tileSize.w;
    this.height = this.tilesInY * GameplayGraphics.tileSize.h;
    this.customGraphics = new ZoneGraphics();
    this.customGraphics.adjustRenderingContext();
  }

  render(camera) {
    const zoneScreenX0 = this.x - camera.x;
    const zoneScreenY0 = this.y - camera.y;

    const { width: screeenWidth, height: screeenHeight } = GameplayGraphics.screen;

    const optimizationLevel = FexGlobals.mapRenderingOptimizationLevel.get();
    if (optimizationLevel > 0
      && (zoneScreenX0 > screeenWidth || zoneScreenX0 + this.width < 0 || zoneScreenY0 > screeenHeight || zoneScreenY0 + this.height < 0)
    ) return;

    const { scanline, layers } = this.tileMap;
    const { w, h } = GameplayGraphics.tileSize;

    const maxTilesInScreenX = Math.ceil(screeenWidth / w) + 1;
    const maxTilesInScreenY = Math.ceil(screeenHeight / h) + 1;

    if (optimizationLevel > 2) {
      const x0 = Math.max(0, Math.floor(0 - zoneScreenX0 / w));
      const y0 = Math.max(0, Math.floor(0 - zoneScreenY0 / h));

      for (let xi = x0; xi < x0 + maxTilesInScreenX; ++xi) {
        for (let yi = y0; yi < y0 + maxTilesInScreenY; ++yi) {
          const i = yi * scanline + xi;
          this.tileSet.render(layers[0][i], zoneScreenX0 + xi * w, zoneScreenY0 + yi * h); // back
          this.tileSet.render(layers[1][i], zoneScreenX0 + xi * w, zoneScreenY0 + yi * h); // front
        }
      }
    } else {
      for (let l = 0; l < layers.length; ++l) {
        const data = layers[l];
        for (let i = 0; i < data.length; ++i) {
          const finalX = zoneScreenX0 + (i % scanline) * w;
          const finalY = zoneScreenY0 + Math.floor(i / scanline) * h;

          if (optimizationLevel > 1
        && (finalX > screeenWidth || finalX + w < 0 || finalY > screeenHeight || finalY + h < 0)
          ) continue;

          this.tileSet.render(data[i], finalX, finalY);
        }
      }
    }
  }

  preRender() {
    const { scanline, layers, length } = this.tileMap;
    const { tileSize: { w, h }, scale } = GameplayGraphics;

    this.customGraphics.scale = scale;
    this.customGraphics.canvas.width = this.width * scale;
    this.customGraphics.canvas.height = this.height * scale;
    this.customGraphics.noBlur();
    this.tileSet.graphics = this.customGraphics;

    for (let yi = 0; yi < length / scanline; ++yi) {
      for (let xi = 0; xi < scanline; ++xi) {
        const i = yi * scanline + xi;
        this.tileSet.render(layers[0][i], xi * w, yi * h); // back
        this.tileSet.render(layers[1][i], xi * w, yi * h); // front
      }
    }

    this.tileSet.graphics = GameplayGraphics;
  }

  renderFast(camera) {
    const x = this.x - camera.x;
    const y = this.y - camera.y;
    GameplayGraphics.renderingContext2D.drawImage(this.customGraphics.canvas, x * GameplayGraphics.scale, y * GameplayGraphics.scale);
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
    // this.airFriction = 0.00005;
    this.airFriction = defaultFriction / 2;
    this.collisionInfo = {
      isInAir: false,
      friction: this.airFriction,
      dead: false,
      map: Array(2).fill().map(() => ({
        validZone: false,
        tilesInfo: Array(this.collisionCheckAreaInTiles.area).fill().map(() => ({
          x: null, y: null, tileMark: TileMark.Skipped, tileHitboxAbsoluteBound: new Bound(),
        })),
      })),
    };

    this.zoneIndexes = [null, null];
  }

  preRender() {
    this.zones.forEach((zone) => {
      zone.preRender();
    });
  }

  render(camera) {
    const renderMethod = FexGlobals.useRenderCache.get() ? 'renderFast' : 'render';
    this.zones.forEach(zone => zone[renderMethod](camera));
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
    this.collisionInfo.dead = false;
    const { map } = this.collisionInfo;
    for (let i = 0; i < map.length; ++i) {
      map[i].validZone = false;
      for (let j = 0; j < map[i].tilesInfo.length; ++j) {
        map[i].tilesInfo[j].x = null;
        map[i].tilesInfo[j].y = null;
        map[i].tilesInfo[j].tileMark = 0;
        map[i].tilesInfo[j].tileIndex = null;
        map[i].tilesInfo[j].tileSet = null;
        Bound.clear(map[i].tilesInfo[j].tileHitboxAbsoluteBound);
      }
    }
  }

  setCollisionInfo(entity, elapsedTime) {
    const { hitbox: characterHitbox, velocity } = entity;
    const { tileSize } = GameplayGraphics;

    // TOCACHE (probably I don't need to do this everytime)
    this.clearCollisionMap();

    const { map } = this.collisionInfo;

    this.setZoneIndexes(characterHitbox);

    const lockVelocityX = false;
    const lockVelocityY = false;

    for (let a = 0; a < this.zoneIndexes.length; ++a) {
      const zoneIndex = this.zoneIndexes[a];
      const validZone = zoneIndex !== null;

      if (validZone) {
        map[a].validZone = true;

        const {
          x: xZone, y: yZone, tilesInX, tilesInY, tileSet,
        } = this.zones[zoneIndex];

        const xOffset = characterHitbox.getAbsoluteX() - xZone;
        const yOffset = characterHitbox.getAbsoluteY() - yZone;
        const xBaseTileIndex = Math.floor(xOffset / tileSize.w);
        const yBaseTileIndex = Math.floor(yOffset / tileSize.h);
        const { tileMap } = this.zones[zoneIndex];
        const tileMapData = tileMap.layers[tileMap.layers.length - 1];

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

              const yRasterPos = yTileIndex - yBaseTileIndex;
              const xRasterPos = xTileIndex - xBaseTileIndex;
              const rasterPos = yRasterPos * areaWidth + xRasterPos;

              map[a].tilesInfo[rasterPos].x = tileBoundX;
              map[a].tilesInfo[rasterPos].y = tileBoundY;

              const tileValue = tileMapData[tileMap.scanline * yTileIndex + xTileIndex];

              map[a].tilesInfo[rasterPos].tileMark = TileMark.Empty;
              if (tileValue > 0) {
                map[a].tilesInfo[rasterPos].tileMark = TileMark.Occupied;
                map[a].tilesInfo[rasterPos].tileIndex = tileValue - 1;
                map[a].tilesInfo[rasterPos].tileSet = tileSet;

                const { tileHitboxAbsoluteBound } = map[a].tilesInfo[rasterPos];
                tileSet.fillHitboxAbsoluteBound(tileValue - 1, tileHitboxAbsoluteBound);

                // use custom hitbox for tile 2 (third tile) when comming from above
                const customTileStartY = 7;
                if ((tileValue === 1 || tileValue === 3) && characterHitbox.getAbsoluteY() < tileBoundY + customTileStartY && velocity.y > 0) {
                  tileHitboxAbsoluteBound.x = 0;
                  tileHitboxAbsoluteBound.y = customTileStartY;
                  tileHitboxAbsoluteBound.width = tileSize.w;
                  tileHitboxAbsoluteBound.height = 9;
                }

                if (characterHitbox.collidesWithBound(
                  tileBoundX + tileHitboxAbsoluteBound.x, tileBoundY + tileHitboxAbsoluteBound.y, tileHitboxAbsoluteBound.width, tileHitboxAbsoluteBound.height,
                )) {
                  map[a].tilesInfo[rasterPos].tileMark = TileMark.Collided;

                  const tileIdx = tileValue - 1;
                  if (tileIdx === 24 || tileIdx === 25 || tileIdx === 26 || tileIdx === 29) {
                    this.collisionInfo.dead = true;
                    return;
                  }

                  const penetrationDepthY = characterHitbox.minkowskiDifference.y + (velocity.y > 0 && characterHitbox.minkowskiDifference.height);
                  const penetrationDepthX = characterHitbox.minkowskiDifference.x + (velocity.x > 0 && characterHitbox.minkowskiDifference.width);

                  const factorToReachYAxis = Math.abs(penetrationDepthX / velocity.x);
                  const factorToReachXAxis = Math.abs(penetrationDepthY / velocity.y);
                  if (factorToReachXAxis <= factorToReachYAxis) { // TODO: considerate equality case separatly and resolve in both axes
                    entity.position.y -= penetrationDepthY;
                    entity.velocity.y = 0;

                    if (penetrationDepthY > 0) this.collisionInfo.isInAir = false;

                    this.collisionInfo.friction = tileFriction(tileValue);
                  } else if (factorToReachXAxis > factorToReachYAxis) {
                    entity.position.x -= penetrationDepthX;
                    entity.velocity.x = 0;
                  }
                }
              }
            }
          }
        }
      }
    }

    return this.collisionInfo;
  }

  copyTileCoordsInBound(zoneIndex, xTile, yTile, bound) {
    bound.x = this.zones[zoneIndex].x + xTile * GameplayGraphics.tileSize.w;
    bound.y = this.zones[zoneIndex].y + yTile * GameplayGraphics.tileSize.h;
    bound.width = bound.width && GameplayGraphics.tileSize.w;
    bound.height = bound.height && GameplayGraphics.tileSize.h;
  }
}

export { Zone, World };
