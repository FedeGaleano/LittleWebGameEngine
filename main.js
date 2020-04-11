import menu from './menu.js';
import game from './src/game.js';
import { loadResources, resources } from './engine/resources.js';
import { GameplayGraphics, AskForRotationGraphics } from './engine/rendering.js';
import Sprite from './engine/sprite.js';
import FexDebug from './engine/debug.js';

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

export default function run() {
  let frameCount = 0;
  let fps = 0;
  let lastTime = 0;

  function askForRotationLoop() {
    if (rotationSprite === null) {
      rotationSprite = new Sprite(
        resources.rotationImage, 4, [10, 10, 10, 20], AskForRotationGraphics,
      );
    }
    AskForRotationGraphics.renderer.clearScreen();
    rotationSprite.update();
    rotationSprite.render(
      (screen.width - rotationSprite.frameWidth) / 2,
      (screen.height - rotationSprite.frameHeight) / 2,
    );
  }

  function gameLoop() {
    handleInput();
    scene.update();
    scene.render();

    FexDebug.setGeneralInfo({ fps });
    FexDebug.render(GameplayGraphics);
  }

  let loopManager = () => { throw new Error('Loop manager called before first assignment'); };

  function clearInputStatus(input) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in input) {
      // eslint-disable-next-line no-prototype-builtins
      if (input.hasOwnProperty(key)) {
        input[key] = false;
      }
    }
  }

  function clearInput() {
    clearInputStatus(isFired);
    clearInputStatus(isPressed);
    clearInputStatus(isReleased);
  }

  function chooseLoopManager() {
    clearInput();
    if (/^portrait/i.test(window.screen.orientation.type)) {
      GameplayGraphics.canvas.style.display = 'none';
      AskForRotationGraphics.canvas.style.display = 'inline';
      loopManager = askForRotationLoop;
      tryToExecute(scene.onFocusLost);
    } else {
      GameplayGraphics.canvas.style.display = 'inline';
      AskForRotationGraphics.canvas.style.display = 'none';
      loopManager = gameLoop;
      tryToExecute(scene.onFocusRecovered);
    }
  }

  function loop(now) {
    ++frameCount;
    if (now - lastTime > 1000) {
      fps = frameCount;
      frameCount = 0;
      lastTime += 1000;
    }

    if (!document.hasFocus()) {
      tryToExecute(scene.onFocusLost);
    }
    loopManager();

    window.requestAnimationFrame(loop);
  }

  function start() {
    loadResources().then(() => {
      tryToExecute(scene.init);
      chooseLoopManager();
      loop();
    })
      .then(() => {
        FexDebug.logOnConsole('font: ', GameplayGraphics.renderingContext2D.font);
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

  window.addEventListener('orientationchange', chooseLoopManager);

  window.onload = start;
}
