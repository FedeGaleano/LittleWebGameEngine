/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

import InputBuffer from './InputBuffer.js';
import TouchScreenArea from './TouchScreenArea.js';
import FexDebug from './debug.js';

class Scene {
  constructor() {
    this.finish = () => {};
    this.clearInputState();
    this.inputRecovery = null;
    this.volatileTouchScreenAreas = [];
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.postUpdate = this.postUpdate.bind(this);
    this.onFinish = this.onFinish.bind(this);
    this.onFocusLost = this.onFocusLost.bind(this);
    this.onFocusRecovered = this.onFocusRecovered.bind(this);
    this.clicked = this.clicked.bind(this);
    this.mouseOver = this.mouseOver.bind(this);
    this.virtualButtons = {};
  }

  init() {
    throw new Error('Scene::init() method not implemented');
  }

  update(elapsedTime, now) {
    throw new Error('Scene::update() method not implemented');
  }

  render(camera) {
    throw new Error('Scene::render() method not implemented');
  }

  postUpdate() {

  }

  onFinish(callback) {
    this.finish = callback;
  }

  onFocusLost() {

  }

  onFocusRecovered() {

  }

  onScreenResize() {

  }

  clicked(x, y) {

  }

  mouseOver(x, y) {

  }

  registerVolatileTouchScreenArea(touchScreenArea) {
    this.volatileTouchScreenAreas.push(touchScreenArea.name);
    InputBuffer.registerTouchScreenArea(touchScreenArea);
  }

  deleteAllVolatileTouchScreenAreas() {
    this.volatileTouchScreenAreas.forEach((areaName) => {
      InputBuffer.deleteTouchScreenArea(areaName);
    });
  }

  static createEmptyInputState() {
    return { keyboard: {}, touchScreen: {} };
  }

  clearInputState() {
    this.fired = Scene.createEmptyInputState();
    this.pressed = Scene.createEmptyInputState();
    this.released = Scene.createEmptyInputState();
  }

  createVirtualButton(virtualButtonName, { keys, touchScreenAreas }) {
    this.virtualButtons[virtualButtonName] = { keys, touchScreenAreas };
  }

  on(state, virtualButtonName, action) {
    if (state !== 'fired' && state !== 'pressed' && state !== 'released') throw new Error(`virtual button state: "${state}" not recognized`);
    const virtualButton = this.virtualButtons[virtualButtonName];
    virtualButton.keys.forEach((keyName) => {
      this[state].keyboard[keyName] = action;
    });
    virtualButton.touchScreenAreas.forEach((touchScreenAreaName) => {
      this[state].touchScreen[touchScreenAreaName] = action;
    });
  }

  onFired(virtualButtonName, action) {
    this.on('fired', virtualButtonName, action);
  }

  onPressed(virtualButtonName, action) {
    this.on('pressed', virtualButtonName, action);
  }

  onReleased(virtualButtonName, action) {
    this.on('released', virtualButtonName, action);
  }

  // asd() {
  //   this.registerVirtualButton('jump', {
  //     keys: ['Space', 'ArrowUp'],
  //     touchScreenAreas: ['jumpArea'],
  //   });

  //   this.on('pressed', 'jump', () => {

  //   });
  //   this.onPressed('jump', () => {

  //   });
  // }
}

export default Scene;
