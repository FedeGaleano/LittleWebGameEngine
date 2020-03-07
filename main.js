import menu from './menu.js';
import game from './src/game.js';
import { loadResources, resources } from './engine/resources.js';
import { GameplayGraphics, AskForRotationGraphics } from './engine/rendering.js';
import Sprite from './engine/sprite.js';

const { screen } = AskForRotationGraphics;
const fullScreenButton = document.getElementById('fullScreenButton');
const fullScreenImage = document.getElementById('fullScreenImage');

let rotationSprite = null;

function fullScreenSetting() {
  fullScreenButton.onclick = exitFullScreen;
  fullScreenImage.src = 'res/exitFullScreen.png';
}

function goFullScreen() {
  document.body.requestFullscreen();
  fullScreenSetting();
}

function normalScreenSetting() {
  fullScreenButton.onclick = goFullScreen;
  fullScreenImage.src = 'res/goFullScreen.png';
}

function exitFullScreen() {
  document.exitFullscreen();
  normalScreenSetting();
}

function reactToFullscreenChange() {
  if (document.fullscreenElement) {
    fullScreenSetting();
  } else {
    normalScreenSetting();
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    exitFullScreen();
  } else {
    goFullScreen();
  }
}

fullScreenButton.onclick = goFullScreen;
document.addEventListener('fullscreenchange', reactToFullscreenChange);

const isPressed = {};
const isFired = {};
const isReleased = {};
const isTouching = false;

const scene = game;

function handleInput() {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in scene.pressed) {
    // eslint-disable-next-line no-prototype-builtins
    if (scene.pressed.hasOwnProperty(key) && isPressed[key]) {
      scene.pressed[key]();
    }
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const key in scene.fired) {
    // eslint-disable-next-line no-prototype-builtins
    if (scene.fired.hasOwnProperty(key) && isFired[key]) {
      scene.fired[key]();
      isFired[key] = false;
    }
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const key in scene.released) {
    // eslint-disable-next-line no-prototype-builtins
    if (scene.released.hasOwnProperty(key) && isReleased[key]) {
      scene.released[key]();
      isReleased[key] = false;
    }
  }
}

function tryToExecute(func) {
  (func || (() => {}))();
}

function renderFrameRate(frameRate, graphics) {
  const { renderingContext2D, canvasHeight } = graphics;
  const prevColor = renderingContext2D.fillStyle;
  renderingContext2D.fillStyle = 'yellow';
  const fontSize = 18;
  renderingContext2D.font = `bold ${fontSize}px arial`;
  renderingContext2D.fillText(`FPS: ${frameRate}`, 10, canvasHeight - (10 + fontSize), 160);
  renderingContext2D.fillStyle = prevColor;
}

function renderScale(graphics) {
  const { renderingContext2D, canvasHeight, scale } = graphics;
  const prevColor = renderingContext2D.fillStyle;
  renderingContext2D.fillStyle = 'yellow';
  const fontSize = 18;
  renderingContext2D.font = `bold ${fontSize}px arial`;
  renderingContext2D.fillText(`Scale: ${scale}`, 10, canvasHeight - (10 + fontSize * 2 + 4), 160);
  renderingContext2D.fillStyle = prevColor;
}

function renderCanvasSize(graphics) {
  const { renderingContext2D, canvasHeight, canvasWidth } = graphics;
  const prevColor = renderingContext2D.fillStyle;
  renderingContext2D.fillStyle = 'yellow';
  const fontSize = 18;
  renderingContext2D.font = `bold ${fontSize}px arial`;
  renderingContext2D.fillText(`w: ${canvasWidth}`, 10, canvasHeight - (10 + fontSize * 3 + 4), 160);
  renderingContext2D.fillText(`h: ${canvasHeight}`, 10, canvasHeight - (10 + fontSize * 4 + 4), 160);
  renderingContext2D.fillStyle = prevColor;
}

export default function run() {
  let frameCount = 0;
  let fps = 0;
  let lastTime = 0;

  function loop(now) {
    ++frameCount;
    if (now - lastTime > 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime += 1000;
    }

    if (rotationSprite === null) {
      rotationSprite = new Sprite(
        resources.rotationImage, 4, [10, 10, 10, 20], AskForRotationGraphics,
      );
    }

    handleInput();
    scene.update();
    scene.render();

    AskForRotationGraphics.renderer.clearScreen();
    rotationSprite.update();
    rotationSprite.render(
      (screen.width - rotationSprite.frameWidth) / 2,
      (screen.height - rotationSprite.frameHeight) / 2,
    );

    renderFrameRate(fps, GameplayGraphics);
    renderScale(GameplayGraphics);
    renderCanvasSize(GameplayGraphics);
    renderFrameRate(fps, AskForRotationGraphics);
    renderScale(AskForRotationGraphics);
    renderCanvasSize(AskForRotationGraphics);
    window.requestAnimationFrame(loop);
  }

  function start() {
    loadResources().then(() => {
      tryToExecute(scene.init);
      loop();
    });
  }

  document.addEventListener('keydown', ({ code }) => {
    if (!isPressed[code]) isFired[code] = true;
    isPressed[code] = true;
  });

  document.addEventListener('keyup', ({ code }) => {
    isPressed[code] = false;
    isReleased[code] = true;
  });

  document.addEventListener('keydown', ({ code }) => {
    if (code === 'KeyF') toggleFullscreen();
    if (code === 'Escape') exitFullScreen();
  });

  document.addEventListener('touchstart', () => {
    if (!isPressed.ScreenTouch) isFired.ScreenTouch = true;
    isPressed.ScreenTouch = true;
  });

  document.addEventListener('touchend', () => {
    isPressed.ScreenTouch = false;
    isReleased.ScreenTouch = true;
  });

  window.onload = start;
}
