import FexDebug from './debug.js';
import Font from './font.js';

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
];

const resources = {};
const fonts = {};

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
  )
    .then(() => {
      fonts.normal = new Font(resources.font);
      FexDebug.logOnConsole('kerning data: ', fonts.normal.kerningData);
    });
}

export { loadResources, resources, fonts };
