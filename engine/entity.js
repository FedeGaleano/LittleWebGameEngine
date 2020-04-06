class Entity {
  constructor(sprite, x = 0, y = 0) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
  }

  update() {
    this.sprite.update();
  }

  render(camera) {
    this.sprite.render(this.x - camera.x, this.y - camera.y);
  }
}

export default Entity;
