/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import Intro from './src/scenes/intro.js';
import Menu from './src/scenes/menu.js';
import Game from './src/scenes/game.js';
import { setEnvironment, resources, fonts } from './engine/resources.js';
import { GameplayGraphics, AskForRotationGraphics, recreate } from './engine/rendering.js';
import Sprite from './engine/sprite.js';
import FexDebug from './engine/debug.js';
import InputBuffer from './engine/InputBuffer.js';
import RotatePhoneScene from './src/rotatePhoneScene.js';
import FexMath from './engine/utils/FexMath.js';
import TouchScreenArea from './engine/TouchScreenArea.js';

let debug = false;
let focus = true;
const focusAlertAlpha = 0;
let orientation = null;
let previousOrientation = null;

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
let debugTouchScreen = false;
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

let gameplaySceneBackup = intro; // first scene
let scene = gameplaySceneBackup;
const previousSceneLastFrame = null;
const outComingFrame = null;
let transitionAlpha = -1;
let transitionSpeed = -0.1;
const transitionEffect = null;

const Effects = {
  none: 0,
  blend: 1,
  fadeInOut: 2,
};

let nextScene = null;

function changeScene(newScene, effect) {
  scene.onFinish(() => {});
  scene.volatileTouchScreenAreas.forEach((areaName) => {
    InputBuffer.deleteTouchScreenArea(areaName);
  });
  scene.volatileTouchScreenAreas = [];
  newScene.init();
  nextScene = newScene;
  transitionAlpha = 0;
  transitionSpeed = 0.1;
}

function renderScene() {
  scene.render();
  if (transitionAlpha >= 0) {
    if (transitionAlpha >= 1) {
      transitionAlpha = 1;
      transitionSpeed *= -1;
      scene = nextScene;
      nextScene = null;
    }
    currentGraphics.renderer.alpha = transitionAlpha;
    currentGraphics.renderer.fillStyle = 'black';
    currentGraphics.renderer.renderFullRectangle();
    currentGraphics.renderer.alpha = 1;
    transitionAlpha += transitionSpeed;
  }
}

intro.onFinish(() => {
  changeScene(menu, Effects.blend);
});
menu.onFinish(() => {
  changeScene(game, Effects.blend);
});

function tryToExecute(func, ...args) {
  if (func) func(...args);
}

function handleInput(elapsedTime, virtualTime) {
  function iterateOverState(state, logic) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in state) {
    // eslint-disable-next-line no-prototype-builtins
      if (state.hasOwnProperty(key) && state[key]) {
        logic(key);
      }
    }
  }

  // const x = Math.floor(cursor.x / currentGraphics.scale);
  // const y = Math.floor(cursor.y / currentGraphics.scale);

  iterateOverState(isPressed.keyboard, (key) => {
    tryToExecute(scene.pressed.keyboard[key], elapsedTime, virtualTime);
  });

  iterateOverState(isPressed.touchScreen, (area) => {
    tryToExecute(scene.pressed.touchScreen[area], elapsedTime, virtualTime);
  });

  iterateOverState(isFired.keyboard, (key) => {
    tryToExecute(scene.fired.keyboard[key], elapsedTime, virtualTime);
    isFired.keyboard[key] = false;
  });

  iterateOverState(isFired.touchScreen, (area) => {
    tryToExecute(scene.fired.touchScreen[area], elapsedTime, virtualTime);
    isFired.touchScreen[area] = false;
  });

  iterateOverState(isReleased.keyboard, (key) => {
    tryToExecute(scene.released.keyboard[key], elapsedTime, virtualTime);
    isReleased.keyboard[key] = false;
  });

  iterateOverState(isReleased.touchScreen, (area) => {
    tryToExecute(scene.released.touchScreen[area], elapsedTime, virtualTime);
    isReleased.touchScreen[area] = false;
  });

  // scene.mouseOver(x, y, elapsedTime);
}

export default function startEngine() {
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
    if (/^portrait/i.test(orientation)) {
      GameplayGraphics.canvas.style.display = 'none';
      AskForRotationGraphics.canvas.style.display = 'inline';
      currentGraphics = AskForRotationGraphics;
      gameplaySceneBackup = scene;
      scene = rotatePhoneScene;
    } else if (GameplayGraphics.canvas.style.display === 'none') {
      GameplayGraphics.canvas.style.display = 'inline';
      AskForRotationGraphics.canvas.style.display = 'none';
      currentGraphics = GameplayGraphics;
      scene = gameplaySceneBackup;
    }
  }

  function handleOrientationChange() {
    scene.onFocusLost();
    chooseLoopManager();
  }

  function loop(now) {
    if (lastTime === 0) lastTime = now;

    if (debugCamera) {
      const changedOrigin = FexDebug.getChangedOrigin();
      currentGraphics.renderingContext2D.fillStyle = currentGraphics.canvas.style.backgroundColor;
      currentGraphics.renderingContext2D.fillRect(changedOrigin.x, changedOrigin.y, currentGraphics.canvas.width, currentGraphics.canvas.height);
    }

    const elapsedTime = now - lastTime;
    deltaTime += elapsedTime;
    fpsTimer += elapsedTime;
    lastTime = now;

    // start focus managment
    const documentHasFocus = document.hasFocus();

    if (focus && !documentHasFocus) {
      clearInput();
      scene.onFocusLost();
    }

    focus = documentHasFocus;
    // end focus managment

    // orientation managment
    orientation = window.screen.orientation.type;
    if (orientation !== previousOrientation) {
      previousOrientation = orientation;
      handleOrientationChange();
    }
    // end orientation amnagment

    if (deltaTime > targetMillisForOneFrame) {
      while (deltaTime > targetMillisForOneFrame) {
        const virtualTime = now - deltaTime;
        handleInput(targetMillisForOneFrame, virtualTime);
        scene.update(targetMillisForOneFrame, virtualTime);
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
      currentGraphics.renderingContext2D.font = `bold ${11}px arial`;
      currentGraphics.renderer.fillStyle = 'rgba(0, 0, 0, 0.9)';
      currentGraphics.renderer.renderFullRectangle(0, -32, 90, 32);
      currentGraphics.renderer.strokeStyle = 'magenta';
      currentGraphics.renderer.renderEmptyRectangle(0, -32, 90, 32);
      currentGraphics.renderer.fillStyle = 'magenta';
      currentGraphics.renderer.renderEmptyRectangle(0, 0, currentGraphics.screen.width, currentGraphics.screen.height);
      currentGraphics.renderingContext2D.drawImage(resources.camera, 2, -resources.camera.height - 10);
      currentGraphics.renderingContext2D.fillText(`x: ${FexMath.precision(Game.camera.x)}`, 0 + resources.camera.width + 15, -resources.camera.height / 2 - 12, 250);
      currentGraphics.renderingContext2D.fillText(`y: ${FexMath.precision(Game.camera.y)}`, 0 + resources.camera.width + 15, -resources.camera.height / 2, 250);
      Game.cameraFollowBox.render(Game.camera);
    }
    if (debugTouchScreen) {
      const areas = InputBuffer.getRegisteredTouchScreenAreas();
      for (const areaName in areas) {
        // eslint-disable-next-line no-prototype-builtins
        if (areas.hasOwnProperty(areaName)) {
          const area = areas[areaName];
          // currentGraphics.renderer.renderFullRectangle(
          //   area.upperLeftCornerX, area.upperLeftCornerY, area.width, area.height, 'green'/* 'argb(0, 255, 255, 0.5)' */,
          // );
          currentGraphics.renderer.alpha = 1;
          currentGraphics.renderer.renderEmptyRectangle(
            area.upperLeftCornerX, area.upperLeftCornerY, area.width, area.height, '#00FF00',
          );
        }
      }
    }

    if (!focus) {
      GameplayGraphics.renderer.fillStyle = 'black';
      GameplayGraphics.renderer.alpha = 0.75;
      // focusAlertAlpha = (focusAlertAlpha + 0.1) % 1;
      // currentGraphics.renderer.alpha = focusAlertAlpha;
      GameplayGraphics.renderer.renderFullRectangle();
      GameplayGraphics.renderer.alpha = 1;
      GameplayGraphics.renderer.renderBitmapCentered(resources.focusAlertWindow);
    }

    window.requestAnimationFrame(loop);
  }

  function start() {
    setEnvironment().then(() => {
      rotatePhoneScene.init();
      scene.init();
      orientation = previousOrientation = window.screen.orientation.type;
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
    if (code === 'KeyT') { debugTouchScreen = !debugTouchScreen; }
    if (code === 'KeyX') manageDebugCamera();
    if (code === 'KeyM') recreate();
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
          break;
        }
      }
    }

    // cursor.x = Math.round(event.touches[0].clientX);
    // cursor.y = Math.round(event.touches[0].clientY);
    // if (!isPressed.ScreenTouch) isFired.ScreenTouch = true;
    // isPressed.ScreenTouch = true;
  });

  document.addEventListener('touchmove', (event) => {
    const areas = InputBuffer.getRegisteredTouchScreenAreas();

    for (const areaName in areas) {
      let covered = false;
      for (let i = 0; i < event.touches.length; ++i) {
        const x = event.touches[i].clientX;
        const y = event.touches[i].clientY;

        if (areas[areaName].covers(x, y)) {
          covered = true;

          if (!isPressed.touchScreen[areaName]) isFired.touchScreen[areaName] = true;

          break;
        }
      }

      if (!covered && isPressed.touchScreen[areaName]) isReleased.touchScreen[areaName] = true;

      isPressed.touchScreen[areaName] = covered;
    }
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

  // window.addEventListener('orientationchange', handleOrientationChange);

  window.addEventListener('resize', () => scene.onScreenResize());

  window.onload = start;
}
