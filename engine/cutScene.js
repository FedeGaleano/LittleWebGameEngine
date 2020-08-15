function removeEachThatFulfillsBut(arr, cond, callback) {
  for (let i = 0; i < arr.length; ++i) {
    const element = arr[i];
    if (cond(element)) {
      callback(element);
      arr.splice(i--, 1);
    }
  }
}

class CutScene {
  constructor() {
    this.timer = 0;
    this.running = false;
    this.scriptsWaiting = [];
    this.scriptsActive = [];
    this.onInit = () => {};
    this.onFinish = () => {};
    this.init = () => {
      this.running = true;
      this.onInit();
    };
    this.finish = () => {
      this.running = false;
      this.onFinish();
    };
  }

  // So far scripts have to be pushed in order
  on(startTime, code, endTime) {
    code.init = code.init || (() => {});
    code.update = code.update || (() => {});
    code.render = code.render || (() => {});
    code.finish = code.finish || (() => {});
    code.forceFinishTrigger = code.forceFinishTrigger || (() => {});
    this.scriptsWaiting.push({ startTime, code, endTime });
  }

  update(elapsedTime) {
    if (this.running) {
      this.timer += elapsedTime;
      while (this.scriptsWaiting.length > 0 && this.scriptsWaiting[0].startTime <= this.timer) {
        const script = this.scriptsWaiting.shift();
        this.scriptsActive.push(script);
        script.code.init();
      }

      removeEachThatFulfillsBut(this.scriptsActive,
        script => script.code.forceFinishTrigger() || script.endTime <= this.timer,
        (script) => {
          script.code.finish();
        });

      this.scriptsActive.forEach(activeScript => activeScript.code.update(elapsedTime));

      if (this.scriptsActive.length + this.scriptsWaiting.length === 0) {
        this.finish();
      }
    }
  }

  render(camera) {
    if (this.running) {
      this.scriptsActive.forEach(activeScript => activeScript.code.render(camera));
    }
  }
}

export default CutScene;
