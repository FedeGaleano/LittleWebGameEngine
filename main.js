import Game from './src/game.js';
import introduction from './src/introduction.js';
import { loadResources, resources } from './engine/resources.js';
import { GameplayGraphics, AskForRotationGraphics } from './engine/rendering.js';
import Sprite from './engine/sprite.js';
import FexDebug from './engine/debug.js';
import Intro from './engine/intro.js';
import Menu from './src/menu.js';
import InputBuffer from './engine/InputBuffer.js';

let debug = false;
let focus = true;

let currentGraphics = null;
const { screen } = AskForRotationGraphics;
const fullScreenButton = document.getElementById('fullScreenButton');
const fullScreenImage = document.getElementById('fullScreenImage');
const debugButton = document.getElementById('debugButton');

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
debugButton.onclick = () => { debug = !debug; };
document.addEventListener('fullscreenchange', reactToFullscreenChange);

const isPressed = new InputBuffer();
const isFired = new InputBuffer();
const isReleased = new InputBuffer();
const cursor = { x: null, y: null };

const intro = new Intro();
const menu = new Menu();
const game = new Game();
let scene = intro;
let previousSceneLastFrame = null;
let outComingFrame = null;
let transitionAlpha = 1;
let transitionSpeed = -0.1;
let transitionEffect = null;

const Effects = {
  none: 0,
  blend: 1,
  fadeInOut: 2,
};

function changeScene(newScene, effect) {
  scene.onFinish(() => {});
  scene.volatileTouchScreenAreas.forEach((areaName) => {
    InputBuffer.deleteTouchScreenArea(areaName);
  });
  scene.volatileTouchScreenAreas = [];

  let asyncAction = Promise.resolve();
  if (effect === Effects.blend) {
    const { width, height } = currentGraphics.canvas;
    previousSceneLastFrame = currentGraphics.renderingContext2D.getImageData(0, 0, width, height);
    transitionAlpha = 1;
    transitionSpeed = -0.1;
    asyncAction = window.createImageBitmap(previousSceneLastFrame);
  } else if (effect === Effects.fadeInOut) {
    const { width, height } = currentGraphics.canvas;
    previousSceneLastFrame = currentGraphics.renderingContext2D.getImageData(0, 0, width, height);
    transitionAlpha = 0.01;
    transitionSpeed = 0.1;
    asyncAction = window.createImageBitmap(previousSceneLastFrame);
  }
  return asyncAction.then((takenFrame) => {
    transitionEffect = effect;
    outComingFrame = takenFrame;
    newScene.init();
    scene = newScene;
  });
}

intro.onFinish(() => {
  changeScene(menu, Effects.blend);
});
menu.onFinish(() => {
  changeScene(game, Effects.fadeInOut);
});

function renderScene() {
  if (transitionEffect === Effects.fadeInOut && transitionAlpha < 1) {
    transitionAlpha += transitionSpeed;
    currentGraphics.renderingContext2D.drawImage(outComingFrame, 0, 0);
    currentGraphics.renderer.fillStyle = 'black';
    currentGraphics.renderer.alpha = transitionAlpha;
    currentGraphics.renderer.renderFullRectangle(0, 0, currentGraphics.screen.width, currentGraphics.screen.height);
    currentGraphics.renderer.alpha = 1;
    return;
  }
  scene.render();
  if (transitionEffect === Effects.fadeInOut && transitionAlpha >= 1 && transitionAlpha < 2) {
    transitionAlpha += transitionSpeed;
    currentGraphics.renderer.fillStyle = 'black';
    currentGraphics.renderer.alpha = 1 - (transitionAlpha - 1);
    currentGraphics.renderer.renderFullRectangle(0, 0, currentGraphics.screen.width, currentGraphics.screen.height);
    currentGraphics.renderer.alpha = 1;
    return;
  }
  if (transitionEffect === Effects.blend && transitionAlpha > 0) {
    transitionAlpha += transitionSpeed;
    currentGraphics.renderer.alpha = transitionAlpha;
    currentGraphics.renderingContext2D.drawImage(outComingFrame, 0, 0);
    currentGraphics.renderer.alpha = 1;
  }
}

function tryToExecute(func, ...args) {
  (func || (() => {}))(...args);
}

function handleInput(elapsedTime) {
  function iterateOverState(state, logic) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in state) {
    // eslint-disable-next-line no-prototype-builtins
      if (state.hasOwnProperty(key) && state[key]) {
        logic(key);
      }
    }
  }

  const x = Math.floor(cursor.x / currentGraphics.scale);
  const y = Math.floor(cursor.y / currentGraphics.scale);

  iterateOverState(isPressed.keyboard, (key) => {
    tryToExecute(scene.pressed[key], x, y, elapsedTime);
  });

  iterateOverState(isPressed.touchScreen, (key) => {
    tryToExecute(scene.pressed.touchScreen[key], x, y, elapsedTime);
  });

  iterateOverState(isFired.keyboard, (key) => {
    tryToExecute(scene.fired[key], x, y, elapsedTime);
    isFired.keyboard[key] = false;
  });

  iterateOverState(isFired.touchScreen, (key) => {
    tryToExecute(scene.fired.touchScreen[key], x, y, elapsedTime);
    isFired.touchScreen[key] = false;
  });

  iterateOverState(isReleased.keyboard, (key) => {
    tryToExecute(scene.released[key], x, y, elapsedTime);
    isReleased.keyboard[key] = false;
  });

  iterateOverState(isReleased.touchScreen, (key) => {
    tryToExecute(scene.released.touchScreen[key], x, y, elapsedTime);
    isReleased.touchScreen[key] = false;
  });

  scene.mouseOver(x, y, elapsedTime);
}

export default function run() {
  let frameCount = 0;
  let fps = 0;
  let lastTime = 0;
  let deltaTime = 0;
  const targetFPS = 60;
  const targetSecondsForOneFrame = 1 / targetFPS;
  const targetMillisForOneFrame = targetSecondsForOneFrame * 1000;
  FexDebug.logOnConsole('targetMillisForOneFrame: ', targetMillisForOneFrame);
  let fpsTimer = 0;
  const info = { fps };

  function askForRotationLoop(elapsedTime) {
    if (rotationSprite === null) {
      rotationSprite = new Sprite(
        resources.rotationImage, 4, [200, 200, 200, 400], AskForRotationGraphics,
      );
    }
    AskForRotationGraphics.renderer.clearScreen();
    rotationSprite.update(elapsedTime);
    rotationSprite.render(
      (screen.width - rotationSprite.frameWidth) / 2,
      (screen.height - rotationSprite.frameHeight) / 2,
    );
  }

  function gameLoop() {
    if (deltaTime > targetMillisForOneFrame) {
      handleInput(deltaTime);
      while (deltaTime > targetMillisForOneFrame) {
        scene.update(targetMillisForOneFrame);
        deltaTime -= targetMillisForOneFrame;
      }
      renderScene();
      ++frameCount;
      scene.postUpdate(targetMillisForOneFrame);
    }
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
    FexDebug.logOnConsole('clearInput called!');
    // clearInputStatus(isFired);
    // clearInputStatus(isPressed);
    // clearInputStatus(isReleased);
    isFired.clear();
    isPressed.clear();
    isReleased.clear();
  }

  function chooseLoopManager() {
    clearInput();
    if (/^portrait/i.test(window.screen.orientation.type)) {
      GameplayGraphics.canvas.style.display = 'none';
      AskForRotationGraphics.canvas.style.display = 'inline';
      currentGraphics = AskForRotationGraphics;
      loopManager = askForRotationLoop;
    } else {
      GameplayGraphics.canvas.style.display = 'inline';
      AskForRotationGraphics.canvas.style.display = 'none';
      currentGraphics = GameplayGraphics;
      loopManager = gameLoop;
    }
  }

  function loop(now) {
    const elapsedTime = now - lastTime;
    deltaTime += elapsedTime;
    fpsTimer += elapsedTime;
    lastTime = now;

    // start focus managment
    const documentHasFocus = document.hasFocus();

    if (focus && !documentHasFocus) scene.onFocusLost();

    focus = documentHasFocus;
    // end focus managment

    loopManager(deltaTime);

    if (fpsTimer > 1000) {
      fps = frameCount;
      frameCount = 0;
      fpsTimer -= 1000;
    }

    if (debug) {
      info.fps = fps;
      FexDebug.setGeneralInfo(info);
      FexDebug.render(currentGraphics);
    }

    window.requestAnimationFrame(loop);
  }

  function start() {
    loadResources().then(() => {
      tryToExecute(scene.init);
      chooseLoopManager();
      window.requestAnimationFrame(loop);
    });
  }

  document.addEventListener('keydown', ({ code }) => {
    if (!isPressed.keyboard[code]) {
      isFired.keyboard[code] = true;
    }
    isPressed.keyboard[code] = true;
  });

  document.addEventListener('keyup', ({ code }) => {
    isPressed.keyboard[code] = false;
    isReleased.keyboard[code] = true;
  });

  document.addEventListener('keydown', ({ code }) => {
    if (code === 'KeyF') toggleFullscreen();
    if (code === 'Escape') exitFullScreen();
    if (code === 'KeyL') { debug = !debug; }
  });

  document.addEventListener('touchstart', (event) => {
    for (let i = 0; i < event.touches.length; ++i) {
      const x = event.touches[i].clientX;
      const y = event.touches[i].clientY;

      const areas = InputBuffer.getRegisteredTouchScreenAreas();

      // eslint-disable-next-line no-restricted-syntax
      for (const areaName in areas) {
        if (areas[areaName].covers(x, y)) {
          if (!isPressed.touchScreen[areaName]) isFired.touchScreen[areaName] = true;
          isPressed.touchScreen[areaName] = true;
        }
      }
    }

    // cursor.x = Math.round(event.touches[0].clientX);
    // cursor.y = Math.round(event.touches[0].clientY);
    // if (!isPressed.ScreenTouch) isFired.ScreenTouch = true;
    // isPressed.ScreenTouch = true;
  });

  document.addEventListener('touchend', (event) => {
    for (let i = 0; i < event.changedTouches.length; ++i) {
      const x = event.changedTouches[i].clientX;
      const y = event.changedTouches[i].clientY;

      const areas = InputBuffer.getRegisteredTouchScreenAreas();

      // eslint-disable-next-line no-restricted-syntax
      for (const areaName in areas) {
        if (areas[areaName].covers(x, y)) {
          // REVIEW: another touch can be still pressing the area
          isPressed.touchScreen[areaName] = false;
          isReleased.touchScreen[areaName] = true;
        }
      }
    }

    // isPressed.ScreenTouch = false;
    // isReleased.ScreenTouch = true;
  });

  document.addEventListener('mousemove', (event) => {
    cursor.x = Math.round(event.clientX);
    cursor.y = Math.round(event.clientY);
  });

  document.addEventListener('mousedown', (event) => {
    cursor.x = Math.round(event.clientX);
    cursor.y = Math.round(event.clientY);

    if (!isPressed.Click) isFired.Click = true;
    isPressed.Click = true;
  });

  document.addEventListener('mouseup', () => {
    isPressed.Click = false;
    isReleased.Click = true;
  });

  window.addEventListener('orientationchange', () => {
    scene.onFocusLost();
    chooseLoopManager();
  });

  window.addEventListener('resize', scene.init);

  window.onload = start;
}
