/* eslint-disable no-empty-function */
import Dialog from './dialog.js';
import { fonts } from './resources.js';

class Speech {
  constructor(bottomLeftCornerX, bottomLeftCornerY, paragraphs, textSpeed) {
    this.dialogs = paragraphs.map(
      (paragraph, i) => new Dialog(
        bottomLeftCornerX, bottomLeftCornerY, paragraph, fonts.normal, textSpeed,
        ({ open: /* i === 0 */true, close: i === paragraphs.length - 1 }),
      ),
    );
    this.currentDialog = -1;
    this.complete = false;
    this.updateBehaviour = () => {};
    this.renderBehaviour = () => {};

    this.audio = new Audio('res/select2.wav');

    // binds
    this.update = this.update.bind(this);
    this.render = this.render.bind(this);
    this.normalUpdate = this.normalUpdate.bind(this);
    this.normalRender = this.normalRender.bind(this);
    this.next = this.next.bind(this);
    this.setBottomLeftCorner = this.setBottomLeftCorner.bind(this);
  }

  update(elapsedTime) {
    this.updateBehaviour(elapsedTime);
  }

  render(camera) {
    this.renderBehaviour(camera);
  }

  normalUpdate(elapsedTime) {
    this.dialogs[this.currentDialog].update(elapsedTime);
  }

  normalRender(camera) {
    this.dialogs[this.currentDialog].render(camera);
  }

  next() {
    if (this.currentDialog < 0) {
      this.complete = false;
      this.currentDialog++;
      this.updateBehaviour = this.normalUpdate;
      this.renderBehaviour = this.normalRender;
      this.audio.play();
      return;
    }

    if (this.dialogs[this.currentDialog].complete) {
      this.dialogs[this.currentDialog].reset();
      if (++this.currentDialog >= this.dialogs.length) {
        this.updateBehaviour = this.renderBehaviour = () => {};
        this.currentDialog = -1;
        this.complete = true;
        return;
      }
      this.audio.play();
    } else {
      this.dialogs[this.currentDialog].forceCompleteText();
    }
  }

  setBottomLeftCorner(x, y) {
    this.dialogs.forEach((d) => {
      d.setBottomLeftCorner(x, y);
    });
  }

  get closed() {
    return this.currentDialog === -1;
  }

  // eslint-disable-next-line no-empty-function
  // eslint-disable-next-line class-methods-use-this
  set closed(_) { }
}

export default Speech;
