/* eslint-disable class-methods-use-this */
/* eslint-disable no-unused-vars */

class Scene {
  constructor() {
    this.onFinishCallBack = () => {};
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
}

export default Scene;
