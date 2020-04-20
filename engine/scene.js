/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

class Scene {
  constructor() {
    this.onFinishCallBack = () => {};
    this.pressed = {};
    this.fired = {};
    this.released = {};
    this.init = this.init.bind(this);
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
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

  onFinish(callback) {
    this.onFinishCallBack = callback;
  }

  onFocusLost() {

  }

  onFocusRecovered() {

  }

  clicked(x, y) {

  }

  mouseOver(x, y) {

  }
}

export default Scene;
