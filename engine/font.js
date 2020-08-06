const context2D = document.createElement('canvas').getContext('2d');
const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890:,()<.';
const spaceWidth = 2;

class Font {
  constructor(bitmap) {
    // REFACTORME: hardcoded cell size
    this.cellWidth = 5;
    this.cellHeight = 8;

    this.kerningData = [];
    this.kerningData[-1] = spaceWidth;
    this.bitmap = bitmap;

    context2D.canvas.width = bitmap.width;
    context2D.canvas.height = bitmap.height;
    context2D.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

    for (let i = 0; i < letters.length; i++) {
      const x = i * (this.cellWidth + 1) + this.cellWidth;
      const imageData = context2D.getImageData(x, 0, 1, 1);
      const rgba = imageData.data;
      this.kerningData.push(rgba[0]);
    }

    this.measureText = this.measureText.bind(this);
  }

  static getLetterIndex(letter) {
    return letters.indexOf(letter);
  }

  measureText(string) {
    const x = this.kerningData[0];
    let counter = 0;
    counter = 0;

    for (let index = 0; index < string.length; ++index) {
      counter += this.kerningData[Font.getLetterIndex(string[index])] + 1;
    }

    return counter;
  }
}

export default Font;
