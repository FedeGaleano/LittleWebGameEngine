import Graphics from './graphics.js';
import FexDebug from './debug.js';

class GameplayGraphicsClass extends Graphics {
  constructor() {
    super();
  }

  rescale() {
    // const minimumNumberOfTilesInYAxis = 5;
    // const maximumNumberOfTilesInYAxis = 8;
    // const maxScale = Math.floor(
    //   this.canvasHeight / (minimumNumberOfTilesInYAxis * this.tileSize.h),
    // );
    // const minScale = Math.ceil(
    //   this.canvasHeight / (maximumNumberOfTilesInYAxis * this.tileSize.h),
    // );
    // this.scale = minScale;

    this.scale = Math.floor(this.canvasHeight / 200);
    this.scale = Math.min(
      Math.floor(this.canvasWidth / 100), this.scale,
    );
    this.scale = Math.max(Math.round(this.scale * 1.25), 2);
    // this.scale = 3;

    // this.scale = 8;
  }
}

class AskForRotationGraphicsClass extends Graphics {
  constructor() {
    super();
  }

  rescale() {
    this.scale = Math.floor(this.canvasHeight / 150);
  }
}

const GameplayGraphics = new GameplayGraphicsClass();
const AskForRotationGraphics = new AskForRotationGraphicsClass();
const GameplayRenderer = GameplayGraphics.renderer;
const AskForRotationRenderer = AskForRotationGraphics.renderer;

function adjust() {
  FexDebug.setChangedOrigin(0, 0);
  GameplayGraphics.adjustRenderingContext();
  AskForRotationGraphics.adjustRenderingContext();
}

window.addEventListener('orientationchange', adjust);
window.addEventListener('resize', adjust /* () => { console.log('resize'); } */);

GameplayGraphics.canvas.id = 'canvas';
AskForRotationGraphics.canvas.id = 'askToRotatePhone';
document.body.appendChild(GameplayGraphics.presentationCanvas);
document.body.appendChild(AskForRotationGraphics.presentationCanvas);
adjust();

export {
  GameplayGraphics, AskForRotationGraphics, GameplayRenderer, AskForRotationRenderer,
};
