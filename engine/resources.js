import FexDebug from './debug.js';

const resourceLoadingData = [
  { path: 'fede-engine-title.png', resourceName: 'titleImage' },
  { path: 'rotate.png', resourceName: 'rotationImage' },
  { path: 'TRY_01.png', resourceName: 'tryImage' },
  { path: 'engine-demo.png', resourceName: 'demo' },
  { path: 'engine-demo-2-background.png', resourceName: 'background' },
  { path: 'engine-demo-2-stars.png', resourceName: 'stars' },
  { path: 'engine-demo-2-tile.png', resourceName: 'tile' },
  { path: 'engine-demo-2-character.png', resourceName: 'character' },
  { path: 'engine-demo-font.png', resourceName: 'font' },
  { path: 'engine-demo-word-bubble.png', resourceName: 'wordBubble' },
  { path: 'engine-demo-word-bubble-parts.png', resourceName: 'wordBubbleParts' },
  { path: 'fill.png', resourceName: 'fill' },
  { path: 'fex-logo.png', resourceName: 'fexLogo' },
];

const resources = {};

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

export { loadResources, resources };
