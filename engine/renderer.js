import Font from './font.js';

class Renderer {
  constructor(graphics) {
    this.graphics = graphics;
  }

  renderStaticTileGrid() {
    const {
      screen, renderingContext2D, scale, tileSize,
    } = this.graphics;
    this.strokeStyle = 'cyan';
    for (let x = 0; x < screen.width; x += tileSize.w) {
      renderingContext2D.strokeRect(x * scale, 0, 0, screen.height * scale);
    }
    for (let y = 0; y < screen.height; y += tileSize.h) {
      renderingContext2D.strokeRect(0, y * scale, screen.width * scale, 0);
    }
  }

  renderWorldTileGrid(world, camera) {
    const {
      screen, renderingContext2D, scale, tileSize,
    } = this.graphics;
    this.strokeStyle = 'cyan';
    const x0 = world.origin.x;
    const y0 = world.origin.y;
    const w = world.size.width;
    const h = world.size.height;
    for (let x = x0 - camera.x; x <= x0 + w - camera.x; x += tileSize.w) {
      renderingContext2D.strokeRect(x * scale, (y0 - camera.y) * scale, 0, h * scale);
    }
    for (let y = y0 - camera.y; y <= y0 + h - camera.y; y += tileSize.h) {
      renderingContext2D.strokeRect((x0 - camera.x) * scale, y * scale, w * scale, 0);
    }
  }

  renderLine(xa, ya, xb, yb) {
    const { renderingContext2D, scale } = this.graphics;
    renderingContext2D.moveTo(xa * scale, ya * scale);
    renderingContext2D.lineTo(xb * scale, yb * scale);
    renderingContext2D.stroke();
  }

  renderBitmap(image, x, y, w, h) {
    const { renderingContext2D, scale } = this.graphics;
    renderingContext2D.drawImage(
      image,
      x * scale,
      y * scale,
      (w || image.width) * scale,
      (h || image.height) * scale,
    );
  }

  renderSubBitmap(image, x, y, sx, sy, sw, sh, w, h) {
    const { renderingContext2D, scale } = this.graphics;

    renderingContext2D.drawImage(
      image, sx, sy, sw - 0.05, sh - 0.05,
      x * scale, y * scale,
      (w || sw) * scale,
      (h || sh) * scale,
    );
  }

  renderBitmapCentered(image, w, h) {
    const { renderingContext2D, scale, screen } = this.graphics;
    const width = w || image.width;
    const height = h || image.height;
    const x = (screen.width - width) / 2;
    const y = (screen.height - height) / 2;
    renderingContext2D.drawImage(
      image,
      x * scale,
      y * scale,
      width * scale,
      height * scale,
    );
  }

  renderFullRectangle(x, y, w, h, color) {
    const { renderingContext2D, scale } = this.graphics;
    const prevColor = renderingContext2D.fillStyle;
    renderingContext2D.fillStyle = color || prevColor;
    renderingContext2D.fillRect(x * scale, y * scale, w * scale, h * scale);
    renderingContext2D.fillStyle = prevColor;
  }

  renderEmptyRectangle(x, y, w, h, color) {
    const { renderingContext2D, scale } = this.graphics;
    const prevColor = renderingContext2D.strokeStyle;
    renderingContext2D.strokeStyle = color || prevColor;
    renderingContext2D.strokeRect(x * scale, y * scale, w * scale, h * scale);
    renderingContext2D.strokeStyle = prevColor;
  }

  renderLetter(letter, x, y, font) {
    const index = Font.getLetterIndex(letter);
    const { renderingContext2D, scale } = this.graphics;
    renderingContext2D.drawImage(
      font.bitmap,
      index * 6, 0,
      5, 8,
      x * scale, y * scale,
      5 * scale, 8 * scale,
    );
  }

  renderString(string, x, y, font) {
    for (let index = 0,
      cursor = 0; index < string.length;
      cursor += font.kerningData[Font.getLetterIndex(string[index++])] + 1
    ) {
      this.renderLetter(string[index], x + cursor, y, font);
    }
  }

  clearScreen() {
    const { renderingContext2D, canvasWidth, canvasHeight } = this.graphics;
    renderingContext2D.clearRect(0, 0, canvasWidth, canvasHeight);
  }

  get fillStyle() {
    const { renderingContext2D } = this.graphics;
    return renderingContext2D.fillStyle;
  }

  get strokeStyle() {
    const { renderingContext2D } = this.graphics;
    return renderingContext2D.strokeStyle;
  }

  get alpha() {
    const { renderingContext2D } = this.graphics;
    return renderingContext2D.globalAlpha;
  }

  set fillStyle(value) {
    const { renderingContext2D } = this.graphics;
    renderingContext2D.fillStyle = value;
  }

  set strokeStyle(value) {
    const { renderingContext2D } = this.graphics;
    renderingContext2D.strokeStyle = value;
  }

  set alpha(value) {
    const { renderingContext2D } = this.graphics;
    renderingContext2D.globalAlpha = Math.max(0, value);
  }
}

export default Renderer;
