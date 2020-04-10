import Dialog from './dialog.js';

class Speech {
  constructor(bottomLeftCornerX, bottomLeftCornerY, listOfTextLines, textSpeed) {
    this.dialogs = listOfTextLines.map(
      (textLines, i) => new Dialog(
        bottomLeftCornerX, bottomLeftCornerY, textLines, textSpeed,
        ({ open: i === 0, close: i === listOfTextLines.length - 1 }),
      ),
    );
    this.currentDialog = -1;
    this.updateBehaviour = () => {};
    this.renderBehaviour = () => {};
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
      return;
    }

    if (this.dialogs[this.currentDialog].complete) {
      this.dialogs[this.currentDialog].reset();
      if (++this.currentDialog >= this.dialogs.length) {
        this.updateBehaviour = this.renderBehaviour = () => {};
        this.currentDialog = -1;
      }
    } else {
      this.dialogs[this.currentDialog].forceCompleteText();
    }
  }
}

export default Speech;
