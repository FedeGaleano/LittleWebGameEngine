import { GameplayGraphics } from './rendering.js';
import { resources } from './resources.js';

class WordBubble {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.opening = 1;
  }

  render(camera) {
    const point = { x: this.x - camera.x, y: this.y - camera.y };

    // const { width, height } = this;
    const width = this.width * this.opening;
    const height = this.height * this.opening;

    const marginX = 3;
    const marginY = 3;
    const needleHeight = 6;

    /*
          width  marginX
        /--------/---/

    A---B--------C---D     /
    |   |        |   |     | marginY
    E---F--------G---H     /
    |   |        |   |     |  height
    |   |        |   |     |
    I---J--------K---L     /
    |   |        |   |
    M---N--------O---P     /
    |  /                   |
    | /                    | needleHeight
    |/                     |
    Q                      /

    */

    const A = { x: this.x - camera.x, y: this.y - camera.y };
    const B = { x: A.x + marginX, y: A.y };
    const C = { x: B.x + width, y: B.y };
    const D = { x: C.x + marginX, y: C.y };
    const E = { x: A.x, y: A.y + marginY };
    const F = { x: E.x + marginY, y: B.y + marginY };
    const G = { x: F.x + width, y: C.y + marginY };
    const H = { x: G.x + marginX, y: D.y + marginY };
    const I = { x: A.x, y: E.y + height };
    const J = { x: I.x + marginX, y: F.y + height };
    const K = { x: J.x + width, y: G.y + height };
    const L = { x: K.x + marginX, y: H.y + height };
    const M = { x: A.x, y: I.y + marginY };
    const N = { x: M.x + marginX, y: J.y + height };
    const O = { x: N.x + width, y: K.y + marginY };
    const P = { x: O.x + marginX, y: L.y + marginY };
    const Q = { x: A.x, y: M.y + needleHeight };


    GameplayGraphics.renderingContext2D.globalAlpha = this.opening ** 4;

    // Top Left Corner
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, A.x, A.y, 0, 0, marginX, marginY,
    );
    // Top Right Corner
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, C.x, C.y, 3, 0, marginX, marginY,
    );
    // Bottom Left Corner
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, I.x, I.y, 3 * 9, 0, marginX, needleHeight,
    );
    // Bottom Right Corner
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, K.x, K.y, 3 * 3, 0, marginX, marginY,
    );

    // Top Edge
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, B.x, B.y, 3 * 6, 0, 1, marginY, width, 3,
    );
    // Bottom Edge
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, J.x, J.y, 3 * 7, 0, 1, marginY, width, marginY,
    );
    // Left Edge
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, E.x, E.y, 3 * 4, 0, marginX, 1, marginX, height,
    );
    // Right Edge
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, G.x, G.y, 3 * 5, 0, marginX, 1, marginX, height,
    );

    // Fill
    GameplayGraphics.renderer.renderSubBitmapNoRound(
      resources.wordBubbleParts, F.x, F.y, 3 * 8, 0, 1, 1, width, height,
    );

    GameplayGraphics.renderingContext2D.globalAlpha = 1;
  }
}

export default WordBubble;
