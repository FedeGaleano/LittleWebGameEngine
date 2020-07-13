import { GameplayRenderer } from '../rendering.js';
import Physics from './Physics.js';
import FexMath from '../utils/FexMath.js';
import FexDebug from '../debug.js';

class HitBox {
  constructor(entity, x0, y0, relativeWidth, relativeHeight) {
    this.entity = entity;
    this.x0 = x0;
    this.y0 = y0;
    this.relativeWidth = relativeWidth;
    this.relativeHeight = relativeHeight;

    this.xOffset = Math.floor(this.x0 * this.entity.width);
    this.yOffset = Math.floor(this.y0 * this.entity.height);
    this.absoluteWidth = FexMath.precision(this.relativeWidth * this.entity.width);
    this.absoluteHeight = FexMath.precision(this.relativeHeight * this.entity.height);

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
    const mirroredShapeY = -(y + height);
    const mirroredShapeX = -(x + width);

    this.minkowskiDifference.x = FexMath.precision(this.getAbsoluteX() + mirroredShapeX);
    this.minkowskiDifference.y = FexMath.precision(this.getAbsoluteY() + mirroredShapeY);
    this.minkowskiDifference.width = FexMath.precision(width + this.absoluteWidth);
    this.minkowskiDifference.height = FexMath.precision(height + this.absoluteHeight);
  }

  render(camera, collide) {
    const x = this.getAbsoluteX();
    const y = this.getAbsoluteY();
    GameplayRenderer.strokeStyle = collide ? '#FF0000' : '#00FF00';
    GameplayRenderer.renderEmptyRectangle(x - camera.x, y - camera.y, this.absoluteWidth, this.absoluteHeight);
  }

  getAbsoluteX() {
    return FexMath.precision(this.entity.position.x + this.xOffset);
  }

  getAbsoluteY() {
    return FexMath.precision(this.entity.position.y + this.yOffset);
  }
}

export default HitBox;
