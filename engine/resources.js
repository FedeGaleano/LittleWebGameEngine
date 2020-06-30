import FexDebug from './debug.js';
import Font from './font.js';
import TileSet from './Tileset.js';
import Graphics from './graphics.js';
import { GameplayGraphics } from './rendering.js';
import TileMap from './tilemap.js';

const resourceLoadingData = [
  { path: 'fede-engine-title.png', resourceName: 'titleImage' },
  { path: 'rotate.png', resourceName: 'rotationImage' },
  { path: 'TRY_01.png', resourceName: 'tryImage' },
  { path: 'engine-demo.png', resourceName: 'demo' },
  { path: 'engine-demo-2-background.png', resourceName: 'background' },
  { path: 'engine-demo-2-stars.png', resourceName: 'stars' },
  { path: 'engine-demo-2-tile.png', resourceName: 'tile' },
  { path: 'slime.png', resourceName: 'character' },
  { path: 'slime-run.png', resourceName: 'characterRunning' },
  { path: 'slime-run-inverse.png', resourceName: 'characterRunningInverse' },
  { path: 'engine-demo-font.png', resourceName: 'font' },
  { path: 'engine-demo-word-bubble.png', resourceName: 'wordBubble' },
  { path: 'engine-demo-word-bubble-parts.png', resourceName: 'wordBubbleParts' },
  { path: 'fill.png', resourceName: 'fill' },
  { path: 'fex-logo.png', resourceName: 'fexLogo' },
  { path: 'engine-demo-2-playButton.png', resourceName: 'playButton' },
  { path: 'engine-demo-2-title.png', resourceName: 'title' },
  { path: 'engine-demo-button-left.png', resourceName: 'uiButtonLeft' },
  { path: 'engine-demo-button-right.png', resourceName: 'uiButtonRight' },
  { path: 'engine-demo-button-action.png', resourceName: 'uiButtonAction' },
  { path: 'fex-engine-camera.png', resourceName: 'camera' },
  { path: 'tileset-engine-demo.png', resourceName: 'tileset' },
];

const resources = {};
const fonts = {};
const tileMaps = {
  try: 'try.json',
  try2: 'try2.json',
  zone1: 'zone1.json',
};
const tilesets = {};

function loadFonts() {
  FexDebug.logOnConsole('loading fonts');
  fonts.normal = new Font(resources.font);
  FexDebug.logOnConsole('kerning data: ', fonts.normal.kerningData);
}

function loadTileMaps() {
  FexDebug.logOnConsole('loading tileMaps');

  const jsonPaths = Object.keys(tileMaps);
  const createTileMapFromJsonPath = tileMapName => fetch(`tileMaps/${tileMaps[tileMapName]}`)
    .then(res => res.json())
    .then((metadata) => {
      tileMaps[tileMapName] = new TileMap(metadata);
    });

  return Promise.all(jsonPaths.map(createTileMapFromJsonPath));
}

function createTileSets() {
  FexDebug.logOnConsole('creating tilesets');
  tilesets.world = new TileSet(
    resources.tileset, GameplayGraphics.tileSize.w, GameplayGraphics.tileSize.h,
  );
}

function loadResources() {
  FexDebug.logOnConsole('loading resources');
  return Promise.all(
    resourceLoadingData.map(({ path, resourceName }) => {
      const img = new Image();
      img.src = `res/${path}`;
      return new Promise((resolve) => {
        img.onload = () => {
          resources[resourceName] = img;
          resolve();
        };
      });
    }),
  );
}
function setEnvironment() {
  return Promise.resolve()
    .then(loadResources)
    .then(loadFonts)
    .then(loadTileMaps)
    .then(createTileSets);
}

export {
  setEnvironment, resources, fonts, tileMaps, tilesets,
};
