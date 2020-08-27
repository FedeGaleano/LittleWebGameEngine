import { GameplayRenderer } from './rendering.js';
import HitBox from './physics/HitBox.js';
import FexMath from './utils/FexMath.js';

/* eslint-disable no-empty-function */
class Entity {
  constructor(spriteMap, { startingSpriteKey, flip = false, flop = false }, x = 0, y = 0) {
    this.spriteMap = spriteMap;
    this.sprite = spriteMap[startingSpriteKey];
    this.sprite.flip = flip;
    this.sprite.flop = flop;
    this.position = { x, y };
    this.lastStep = { x: 0, y: 0 };
    this.count = 0;
    this.t = 0;
    this.velocity = { x: 0, y: 0 };
    this.normalMovement = () => {};
    this.automaticMovement = this.normalMovement;
    this.hitbox = null;
  }

  updateInternalStructure(elapsedTime) {
    this.lastStep.x = this.velocity.x * elapsedTime;
    this.lastStep.y = this.velocity.y * elapsedTime;
    this.position.x += FexMath.precision(this.lastStep.x);
    this.position.y += FexMath.precision(this.lastStep.y);
    this.sprite.update(elapsedTime);
    ++this.count;
    this.t += elapsedTime * 0.1;
  }

  update(elapsedTime) {
    this.updateInternalStructure(elapsedTime);
  }

  renderSprite(camera = { x: 0, y: 0 }) {
    this.sprite.render(this.position.x - camera.x, this.position.y - camera.y);
  }

  render(camera) {
    this.renderSprite(camera);
  }

  changeSpriteTo(key, flip = false, flop = false) {
    this.sprite = this.spriteMap[key];
    this.sprite.flip = flip;
    this.sprite.flop = flop;
  }

  setAutomaticMovement(updateXYFunction) {
    this.automaticMovement = updateXYFunction;
    this.count = 0;
    this.t = 0;
  }

  resetAutomaticMovement() {
    this.automaticMovement = this.normalMovement;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.t = 0;
  }

  // So far, only one
  addHitbox(x0, y0, width, height) {
    this.hitbox = new HitBox(this, x0, y0, width, height);
  }

  get width() {
    return this.sprite.width;
  }

  // eslint-disable-next-line no-empty-function
  // eslint-disable-next-line class-methods-use-this
  set width(_) {}

  get height() {
    return this.sprite.height;
  }

  // eslint-disable-next-line no-empty-function
  // eslint-disable-next-line class-methods-use-this
  set height(_) {}
}

export default Entity;
