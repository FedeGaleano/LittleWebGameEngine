/* eslint-disable no-empty-function */
class Entity {
  constructor(spriteMap, { startingSpriteKey, flip = false, flop = false }, x = 0, y = 0) {
    this.spriteMap = spriteMap;
    this.sprite = spriteMap[startingSpriteKey];
    this.sprite.flip = flip;
    this.sprite.flop = flop;
    this.x = x;
    this.y = y;
    this.velocity = { x: 0, y: 0 };
    this.normalMovement = () => [this.x, this.y];
    this.automaticMovement = this.normalMovement;
  }

  update(elapsedTime) {
    [this.x, this.y] = this.automaticMovement(this.x, this.y, this.velocity, elapsedTime);
    this.sprite.update(elapsedTime);
  }

  render(camera) {
    this.sprite.render(this.x - camera.x, this.y - camera.y);
  }

  changeSpriteTo(key, flip = false, flop = false) {
    this.sprite = this.spriteMap[key];
    this.sprite.flip = flip;
    this.sprite.flop = flop;
  }

  setAutomaticMovement(updateXYFunction) {
    this.automaticMovement = updateXYFunction;
  }

  resetAutomaticMovement() {
    this.automaticMovement = this.normalMovement;
    this.velocity.x = 0;
    this.velocity.y = 0;
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
