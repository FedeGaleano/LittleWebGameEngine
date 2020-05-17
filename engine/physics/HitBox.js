import { GameplayRenderer } from '../rendering.js';
import Physics from './Physics.js';

class HitBox {
  constructor(entity, x0, y0, relativeWidth, relativeHeight) {
    this.entity = entity;
    this.x0 = x0;
    this.y0 = y0;
    this.relativeWidth = relativeWidth;
    this.relativeHeight = relativeHeight;

    this.xOffset = this.x0 * this.entity.width;
    this.yOffset = this.y0 * this.entity.height;
    this.absoluteWidth = this.relativeWidth * this.entity.width;
    this.absoluteHieght = this.relativeHeight * this.entity.height;

    this.minkowskiDifference = {
      x: null, y: null, width: null, height: null,
    };
  }

  collidesWithHitBox(another) {

  }

  collidesWithBound(x, y, width, height) {
    this.setMinkowskyDifferenceWith(x, y, width, height);

    return Physics.boundContains(this.minkowskiDifference, Physics.origin);
  }

  setMinkowskyDifferenceWith(x, y, width, height) {
    const absoluteX = this.getAbsoluteX();
    const absoluteY = this.getAbsoluteY();

    const mirroredShapeY = -(y + height);
    const mirroredShapeX = -(x + width);

    this.minkowskiDifference.x = absoluteX + mirroredShapeX;
    this.minkowskiDifference.y = absoluteY + mirroredShapeY;
    this.minkowskiDifference.width = width + this.absoluteWidth;
    this.minkowskiDifference.height = height + this.absoluteHieght;
  }

  render(camera, collide) {
    const x = this.getAbsoluteX();
    const y = this.getAbsoluteY();
    GameplayRenderer.strokeStyle = collide ? '#FF0000' : '#00FF00';
    GameplayRenderer.renderEmptyRectangle(x - camera.x, y - camera.y, this.absoluteWidth, this.absoluteHieght);
  }

  getAbsoluteX() {
    return Math.floor(this.entity.position.x + this.xOffset);
  }

  getAbsoluteY() {
    return Math.floor(this.entity.position.y + this.yOffset);
  }
}

export default HitBox;
