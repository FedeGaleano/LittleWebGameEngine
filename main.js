import Game from './src/game.js';
import introduction from './src/introduction.js';
import { loadResources, resources } from './engine/resources.js';
import { GameplayGraphics, AskForRotationGraphics } from './engine/rendering.js';
import Sprite from './engine/sprite.js';
import FexDebug from './engine/debug.js';
import Intro from './engine/intro.js';
import Menu from './src/menu.js';
import InputBuffer from './engine/InputBuffer.js';
import RotatePhoneScene from './src/rotatePhoneScene.js';

let debug = false;
let focus = true;

let currentGraphics = null;
const { screen } = AskForRotationGraphics;
const fullScreenButton = document.getElementById('fullScreenButton');
const fullScreenImage = document.getElementById('fullScreenImage');
const debugButton = document.getElementById('debugButton');

const rotationSprite = null;

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

let debugCamera = false;
let playerScale = null;

function manageDebugCamera() {
  if (!debugCamera) {
    playerScale = currentGraphics.scale;
    const xTranslate = (currentGraphics.canvas.width / 2) * (1 - 1 / playerScale);
    const yTranslate = (currentGraphics.canvas.height / 2) * (1 - 1 / playerScale);
    FexDebug.setChangedOrigin(-xTranslate, -yTranslate);
    currentGraphics.scale = 1;
    currentGraphics.renderingContext2D.translate(xTranslate, yTranslate);
    debugCamera = true;
  } else {
    FexDebug.setChangedOrigin(0, 0);
    currentGraphics.adjustRenderingContext();
    debugCamera = false;
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
const rotatePhoneScene = new RotatePhoneScene();

let gameplaySceneBackup = intro;
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

  function clearInput() {
    FexDebug.logOnConsole('clearInput called!');
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
      gameplaySceneBackup = scene;
      scene = rotatePhoneScene;
    } else {
      GameplayGraphics.canvas.style.display = 'inline';
      AskForRotationGraphics.canvas.style.display = 'none';
      currentGraphics = GameplayGraphics;
      scene = gameplaySceneBackup;
    }
  }

  function loop(now) {
    if (debugCamera) {
      const changedOrigin = FexDebug.getChangedOrigin();
      // currentGraphics.renderingContext2D.translate(changedOrigin.x, changedOrigin.y);
      currentGraphics.renderingContext2D.fillStyle = currentGraphics.canvas.style.backgroundColor;
      currentGraphics.renderingContext2D.fillRect(changedOrigin.x, changedOrigin.y, currentGraphics.canvas.width, currentGraphics.canvas.height);
      // currentGraphics.renderingContext2D.translate(-changedOrigin.x, -changedOrigin.y);
    }

    const elapsedTime = now - lastTime;
    deltaTime += elapsedTime;
    fpsTimer += elapsedTime;
    lastTime = now;

    // start focus managment
    const documentHasFocus = document.hasFocus();

    if (focus && !documentHasFocus) scene.onFocusLost();

    focus = documentHasFocus;
    // end focus managment

    if (deltaTime > targetMillisForOneFrame) {
      while (deltaTime > targetMillisForOneFrame) {
        handleInput(targetMillisForOneFrame);
        scene.update(targetMillisForOneFrame);
        deltaTime -= targetMillisForOneFrame;
      }
      renderScene();
      ++frameCount;
      scene.postUpdate(targetMillisForOneFrame);
    }

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
    if (debugCamera) {
      currentGraphics.renderer.strokeStyle = 'magenta';
      currentGraphics.renderer.renderEmptyRectangle(0, 0, currentGraphics.screen.width, currentGraphics.screen.height);
      currentGraphics.renderingContext2D.drawImage(resources.camera, 0, -resources.camera.height - 5);
    }

    window.requestAnimationFrame(loop);
  }

  function start() {
    loadResources().then(() => {
      rotatePhoneScene.init();
      scene.init();
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
    if (code === 'KeyX') manageDebugCamera();
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
