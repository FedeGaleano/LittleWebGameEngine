import Game from './src/game.js';
import introduction from './src/introduction.js';
import { loadResources, resources } from './engine/resources.js';
import { GameplayGraphics, AskForRotationGraphics } from './engine/rendering.js';
import Sprite from './engine/sprite.js';
import FexDebug from './engine/debug.js';
import Intro from './engine/intro.js';
import Menu from './src/menu.js';

let debug = true;

let currentGraphics = null;
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

const intro = new Intro();
const menu = new Menu();
const game = new Game();
let scene = menu;
let previousSceneLastFrame = null;
let theImage = null;
let transitionAlpha = 1;
const transitionSpeed = 0.1;

function changeScene(newScene, effect) {
  const { width, height } = currentGraphics.canvas;
  previousSceneLastFrame = currentGraphics.renderingContext2D.getImageData(0, 0, width, height);
  transitionAlpha = 1;
  return window.createImageBitmap(previousSceneLastFrame).then((x) => {
    theImage = x;
    newScene.init();
    scene = newScene;
  });
}

intro.onFinish(() => {
  changeScene(menu, 'fade');
});
menu.onFinish(() => {
  changeScene(game, 'fade');
});

function renderScene() {
  scene.render();
  if (theImage && transitionAlpha > 0) {
    transitionAlpha -= transitionSpeed;
    currentGraphics.renderer.alpha = transitionAlpha;
    currentGraphics.renderingContext2D.drawImage(theImage, 0, 0);
    currentGraphics.renderer.alpha = 1;
  }
}

function tryToExecute(func) {
  (func || (() => {}))();
}

function handleInput() {
  function iterateOverState(state, logic) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in state) {
    // eslint-disable-next-line no-prototype-builtins
      if (state.hasOwnProperty(key) && state[key]) {
        logic(key);
      }
    }
  }

  iterateOverState(isPressed, (key) => {
    tryToExecute(scene.pressed[key]);
  });

  iterateOverState(isFired, (key) => {
    tryToExecute(scene.fired[key]);
    isFired[key] = false;
  });

  iterateOverState(isReleased, (key) => {
    tryToExecute(scene.released[key]);
    isReleased[key] = false;
  });
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
    renderScene();
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
      currentGraphics = AskForRotationGraphics;
      loopManager = askForRotationLoop;
      tryToExecute(scene.onFocusLost);
    } else {
      GameplayGraphics.canvas.style.display = 'inline';
      AskForRotationGraphics.canvas.style.display = 'none';
      currentGraphics = GameplayGraphics;
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

    if (debug) {
      FexDebug.setGeneralInfo({ fps });
      FexDebug.render(currentGraphics);
    }

    window.requestAnimationFrame(loop);
  }

  function start() {
    loadResources().then(() => {
      tryToExecute(scene.init);
      chooseLoopManager();
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
    if (code === 'KeyL') { debug = !debug; }
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

  window.addEventListener('resize', scene.init);

  window.onload = start;
}
