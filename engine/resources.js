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
  { path: 'engine-demo-font-2.png', resourceName: 'font2' },
  { path: 'engine-demo-word-bubble.png', resourceName: 'wordBubble' },
  { path: 'engine-demo-word-bubble-parts.png', resourceName: 'wordBubbleParts' },
  { path: 'fill.png', resourceName: 'fill' },
  { path: 'fex-logo.png', resourceName: 'fexLogo' },
  { path: 'engine-demo-2-playButton.png', resourceName: 'playButton' },
  { path: 'this-is-just-a-demo-title.png', resourceName: 'title' },
  { path: 'engine-demo-button-left.png', resourceName: 'uiButtonLeft' },
  { path: 'engine-demo-button-right.png', resourceName: 'uiButtonRight' },
  { path: 'engine-demo-button-action.png', resourceName: 'uiButtonAction' },
  { path: 'engine-demo-button-pause.png', resourceName: 'uiButtonPause' },
  { path: 'engine-demo-button-unpause.png', resourceName: 'uiButtonUnpause' },
  { path: 'engine-demo-button-left-pressed.png', resourceName: 'uiButtonLeftPressed' },
  { path: 'engine-demo-button-right-pressed.png', resourceName: 'uiButtonRightPressed' },
  { path: 'engine-demo-button-jump-pressed.png', resourceName: 'uiButtonActionPressed' },
  { path: 'fex-engine-camera.png', resourceName: 'camera' },
  // { path: 'tileset-engine-demo.png', resourceName: 'tileset' },
  { path: 'tileset-2-engine-demo.png', resourceName: 'tileset2' },
  { path: 'boss.png', resourceName: 'boss' },
  { path: 'engine-demo-focus-alert-window.png', resourceName: 'focusAlertWindow' },
  { path: 'engine-demo-intro.png', resourceName: 'fexIntro' },
  { path: 'engine-demo-key.png', resourceName: 'key' },
  { path: 'flag.png', resourceName: 'flag' },
  { path: 'engine-demo-arrow.png', resourceName: 'arrow' },
  { path: 'fireworks.png', resourceName: 'fireworks' },
  { path: 'engine-demo-2-water.png', resourceName: 'water' },
  { path: 'engine-demo-2-plant.png', resourceName: 'plant' },
];

const resources = {};
const fonts = {};
const tileMaps = {
  try: 'try.json',
  try2: 'try2.json',
  zone1: 'zone1.json',
  zone2: 'zone2.json',
  zone3: 'zone3.json',
  zone4: 'zone4.json',
  cave: 'cave.json',
  cave2: 'cave2.json',
  cave3: 'cave3.json',
  cave4: 'cave4.json',
  cave5: 'cave5.json',
  test: 'test.json',
  demo: 'demo-layered.json',
};

const tilesets = {
  // world: 'tileset-engine-demo.json',
  world: 'tileset2.json',
};

function loadFonts() {
  FexDebug.logOnConsole('loading fonts');
  fonts.normal = new Font(resources.font);
  fonts.normal2 = new Font(resources.font2);
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

  const createTileSetFromJsonPath = tilesetName => fetch(`tileMaps/${tilesets[tilesetName]}`)
    .then(res => res.json())
    .then((metadata) => {
      tilesets[tilesetName] = new TileSet(metadata, resources);
    });

  return Promise.all(
    Object.keys(tilesets)
      .map(createTileSetFromJsonPath),
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
