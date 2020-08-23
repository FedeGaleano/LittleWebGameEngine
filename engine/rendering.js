import Graphics from './graphics.js';
import FexDebug from './debug.js';

class GameplayGraphicsClass extends Graphics {
  rescale() {
    const minimumNumberOfTilesInYAxis = 10;
    const maximumNumberOfTilesInYAxis = 15;

    const bestPossibleScale = Math.round(window.screen.height / (maximumNumberOfTilesInYAxis * this.tileSize.h));

    this.scale = bestPossibleScale;
    while (this.canvasHeight / (this.scale * this.tileSize.h) < minimumNumberOfTilesInYAxis) {
      this.scale = Math.max(1, this.scale - 1);
    }
  }
}

class AskForRotationGraphicsClass extends Graphics {
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
