import Font from './font.js';

const chooseMarkColor = {
  1: '#0000FF',
  2: '#00FF00',
  3: '#FF0000',
};

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

  renderWorldTileGrid(world, camera, collisionInfo) {
    const {
      screen, renderingContext2D, scale, tileSize,
    } = this.graphics;

    for (let a = 0; a < collisionInfo.length; ++a) {
      const { tilesInfo, validZone } = collisionInfo[a];

      if (validZone) {
        for (let i = 0; i < tilesInfo.length; ++i) {
          const { x, y, tileMark } = tilesInfo[i];
          if (tileMark) {
            this.fillStyle = chooseMarkColor[tileMark];
            renderingContext2D.globalAlpha = 0.5;
            renderingContext2D.fillRect((x - camera.x) * scale, (y - camera.y) * scale, tileSize.w * scale, tileSize.h * scale);
            renderingContext2D.globalAlpha = 1;
          }
        }
      }
    }

    this.strokeStyle = 'cyan';
    for (let i = 0; i < world.zones.length; ++i) {
      const zone = world.zones[i];
      const x0 = zone.x;
      const y0 = zone.y;
      const w = zone.width;
      const h = zone.height;
      for (let x = x0 - camera.x; x <= x0 + w - camera.x; x += tileSize.w) {
        renderingContext2D.strokeRect(x * scale, (y0 - camera.y) * scale, 0, h * scale);
      }
      for (let y = y0 - camera.y; y <= y0 + h - camera.y; y += tileSize.h) {
        renderingContext2D.strokeRect((x0 - camera.x) * scale, y * scale, w * scale, 0);
      }
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
    // const render
    renderingContext2D.drawImage(
      image,
      Math.floor(x * scale),
      Math.floor(y * scale),
      (w || image.width) * scale,
      (h || image.height) * scale,
    );
  }

  renderSubBitmap(image, x, y, sx, sy, sw, sh, w, h) {
    const { renderingContext2D, scale } = this.graphics;
    renderingContext2D.drawImage(
      image,
      // SubRectangle
      sx, sy, sw - 0.05, sh - 0.05,
      // Destiny Canvas
      Math.floor(x * scale), Math.floor(y * scale), Math.floor(w || sw) * scale, Math.floor(h || sh) * scale,
    );
  }

  renderSubBitmapNoRound(image, x, y, sx, sy, sw, sh, w, h) {
    const { renderingContext2D, scale } = this.graphics;
    renderingContext2D.drawImage(
      image,
      // SubRectangle
      sx, sy, sw - 0.05, sh - 0.05,
      // Destiny Canvas
      x * scale, y * scale, (w || sw) * scale, (h || sh) * scale,
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

  renderFullRectangle(x = 0, y = 0, w = this.graphics.screen.width, h = this.graphics.screen.height, color) {
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

  createLightSource(x, y, radius, r, g, b, intensity = 1) {
    const { renderingContext2D, scale } = this.graphics;
    const realX = x * scale;
    const realY = y * scale;
    const realRadius = radius * scale;
    const gradient = renderingContext2D.createRadialGradient(realX, realY, 0, realX, realY, realRadius);

    gradient.addColorStop(0, `rgba(${r},${g},${b},${intensity})`);
    gradient.addColorStop(1, `rgba(${0},${0},${0},0.75)`);

    return gradient;
  }

  renderLightSource(lightSource) {
    this.fillStyle = lightSource;
    this.renderFullRectangle();
  }
}

export default Renderer;
