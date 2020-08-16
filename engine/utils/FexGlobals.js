/* eslint-disable no-underscore-dangle */
import FexDebug from '../debug.js';

window._fex_ = {
  globals: {},
};

class GlobalVariable {
  constructor(name, initialValue, { debugMode, isPublic } = { debugMode: false, isPublic: false }) {
    this.name = name;
    this.value = initialValue;
    this.debugMode = debugMode;
    if (isPublic) {
      window._fex_.globals[name] = this;
    }
  }

  get() {
    if (this.debugMode) {
      FexDebug.logOnConsole(`Global variable ${this.name} got as ${this.value}`);
    }
    return this.value;
  }

  set(value) {
    if (this.debugMode) {
      FexDebug.logOnConsole(`Global variable ${this.name} set to ${value}`);
    }
    this.value = value;
  }
}

const FexGlobals = {
  mapRenderingOptimizationLevel: new GlobalVariable('mapRenderingOptimizationLevel', 0, { isPublic: true }),
  useRenderCache: new GlobalVariable('useRenderCache', true),
  useDebugCommands: new GlobalVariable('useDebugCommands', false, { isPublic: true }),
};

export default FexGlobals;
