/* eslint-disable no-empty-function */
import Dialog from './dialog.js';
import { fonts } from './resources.js';

class Speech {
  constructor(bottomLeftCornerX, bottomLeftCornerY, listOfTextLines, textSpeed) {
    this.dialogs = listOfTextLines.map(
      (textLines, i) => new Dialog(
        bottomLeftCornerX, bottomLeftCornerY, textLines, fonts.normal, textSpeed,
        ({ open: /* i === 0 */true, close: i === listOfTextLines.length - 1 }),
      ),
    );
    this.currentDialog = -1;
    this.complete = false;
    this.updateBehaviour = () => {};
    this.renderBehaviour = () => {};

    this.audio = new Audio('res/select2.wav');
  }

  update() {
    this.updateBehaviour();
  }

  render(camera) {
    this.renderBehaviour(camera);
  }

  normalUpdate() {
    this.dialogs[this.currentDialog].update();
  }

  normalRender(camera) {
    this.dialogs[this.currentDialog].render(camera);
  }

  next() {
    if (this.currentDialog < 0) {
      this.complete = false;
      this.currentDialog++;
      this.updateBehaviour = () => this.normalUpdate();
      this.renderBehaviour = camera => this.normalRender(camera);
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
