/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

import InputBuffer from './InputBuffer.js';
import TouchScreenArea from './TouchScreenArea.js';

class Scene {
  constructor() {
    this.finish = () => {};
    this.pressed = Scene.emptyInputState();
    this.fired = Scene.emptyInputState();
    this.released = Scene.emptyInputState();
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
  }

  init() {
    throw new Error('Scene::init() method not implemented');
  }

  update() {
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

  static emptyInputState() {
    return { touchScreen: {} };
  }
}

export default Scene;
