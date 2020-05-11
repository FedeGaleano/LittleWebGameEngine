const registeredTouchScreenAreas = {};
class InputBuffer {
  static registerTouchScreenArea(touchScreenArea) {
    registeredTouchScreenAreas[touchScreenArea.name] = touchScreenArea;
  }

  static deleteTouchScreenArea(name) {
    delete registeredTouchScreenAreas[name];
  }

  static getRegisteredTouchScreenAreas() {
    return registeredTouchScreenAreas;
  }

  constructor() {
    this.keyboard = {};
    this.touchScreen = {};
    this.clear = this.clear.bind(this);
  }

  clear() {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in this.keyboard) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.keyboard.hasOwnProperty(key)) {
        this.keyboard[key] = false;
      }
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const key in this.touchScreen) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.touchScreen.hasOwnProperty(key)) {
        this.touchScreen[key] = false;
      }
    }
  }
}

export default InputBuffer;
