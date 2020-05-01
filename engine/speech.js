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
        return;
      }
      this.audio.play();
    } else {
      this.dialogs[this.currentDialog].forceCompleteText();
    }
  }
}

export default Speech;
