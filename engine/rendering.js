const GameplayGraphics = {
  canvas: document.createElement('canvas'),
  renderingContext2D: null,
  canvasWidth: null,
  canvasHeight: null,
  screen: { width: 0, height: 0 },
  scale: null,
  tileSize: { w: 16, h: 16 },
  rescale() {
    // const minimumNumberOfTilesInYAxis = 5;
    // const maximumNumberOfTilesInYAxis = 8;
    // const maxScale = Math.floor(
    //   GameplayGraphics.canvasHeight / (minimumNumberOfTilesInYAxis * GameplayGraphics.tileSize.h),
    // );
    // const minScale = Math.ceil(
    //   GameplayGraphics.canvasHeight / (maximumNumberOfTilesInYAxis * GameplayGraphics.tileSize.h),
    // );
    // GameplayGraphics.scale = minScale;

    GameplayGraphics.scale = Math.floor(GameplayGraphics.canvasHeight / 100);
    GameplayGraphics.scale = Math.min(
      Math.floor(GameplayGraphics.canvasWidth / 100), GameplayGraphics.scale,
    );

    // GameplayGraphics.scale = 8;
  },
  renderer: {
    renderTileGrid() {
      const {
        screen, renderingContext2D, scale, tileSize,
      } = GameplayGraphics;
      for (let x = 0; x < screen.width; x += tileSize.w) {
        renderingContext2D.strokeRect(x * scale, 0, 0, screen.height * scale);
      }
      for (let y = 0; y < screen.height; y += tileSize.h) {
        renderingContext2D.strokeRect(0, y * scale, screen.width * scale, 0);
      }
    },
    renderLine(xa, ya, xb, yb) {
      const { renderingContext2D, scale } = GameplayGraphics;
      renderingContext2D.moveTo(xa * scale, ya * scale);
      renderingContext2D.lineTo(xb * scale, yb * scale);
      renderingContext2D.stroke();
    },
    renderSprite(image, x, y) {
      const { renderingContext2D, scale } = GameplayGraphics;
      renderingContext2D.drawImage(
        image,
        x * scale,
        y * scale,
        image.width * scale,
        image.height * scale,
      );
    },
    renderFullRectangle(x, y, w, h) {
      const { renderingContext2D, scale } = GameplayGraphics;
      renderingContext2D.fillRect(x * scale, y * scale, w * scale, h * scale);
    },
    clearScreen() {
      const { renderingContext2D, canvasWidth, canvasHeight } = GameplayGraphics;
      renderingContext2D.clearRect(0, 0, canvasWidth, canvasHeight);
    },
    get fillStyle() {
      const { renderingContext2D } = GameplayGraphics;
      return renderingContext2D.fillStyle;
    },
    get strokeStyle() {
      const { renderingContext2D } = GameplayGraphics;
      return renderingContext2D.strokeStyle;
    },
    set fillStyle(value) {
      const { renderingContext2D } = GameplayGraphics;
      renderingContext2D.fillStyle = value;
    },
    set strokeStyle(value) {
      const { renderingContext2D } = GameplayGraphics;
      renderingContext2D.strokeStyle = value;
    },
  },
};
const AskForRotationGraphics = {
  canvas: document.createElement('canvas'),
  renderingContext2D: null,
  canvasWidth: null,
  canvasHeight: null,
  screen: { width: 0, height: 0 },
  scale: null,
  tileSize: { w: 16, h: 16 },
  rescale() {
    AskForRotationGraphics.scale = Math.floor(AskForRotationGraphics.canvasHeight / 150);
  },
  renderer: {
    clearScreen() {
      const { renderingContext2D, canvasWidth, canvasHeight } = AskForRotationGraphics;
      renderingContext2D.clearRect(0, 0, canvasWidth, canvasHeight);
    },
  },
};

function adjustRenderingContext(graphics) {
  graphics.canvas.width = window.innerWidth;
  graphics.canvas.height = window.innerHeight;
  graphics.canvas.style.backgroundColor = '#1E1E1E';
  graphics.canvas.style.padding = graphics.canvas.style.margin = 0;
  document.body.style.overflow = 'hidden';
  document.body.style.padding = document.body.style.margin = 0;

  graphics.renderingContext2D = graphics.canvas.getContext('2d');
  graphics.canvasWidth = graphics.canvas.width;
  graphics.canvasHeight = graphics.canvas.height;

  graphics.rescale();
  if (graphics.scale % 2 !== 0) { graphics.renderingContext2D.translate(0.5, 0.5); }

  graphics.screen.width = graphics.canvasWidth / graphics.scale;
  graphics.screen.height = graphics.canvasHeight / graphics.scale;

  graphics.renderingContext2D.imageSmoothingEnabled = false;
}

function adjust() {
  adjustRenderingContext(GameplayGraphics);
  adjustRenderingContext(AskForRotationGraphics);
}

window.addEventListener('orientationchange', adjust);
window.addEventListener('resize', adjust);

GameplayGraphics.canvas.id = 'canvas';
AskForRotationGraphics.canvas.id = 'askToRotatePhone';
document.body.appendChild(GameplayGraphics.canvas);
document.body.appendChild(AskForRotationGraphics.canvas);
adjust();

export { GameplayGraphics, AskForRotationGraphics };
