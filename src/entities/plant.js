import Entity from '../../engine/entity.js';
import Sprite from '../../engine/sprite.js';
import { GameplayGraphics } from '../../engine/rendering.js';
import { resources } from '../../engine/resources.js';
import Light from '../../engine/light.js';

class Plant extends Entity {
  constructor({ lightColor: { r, g, b } }) {
    super({
      normal: new Sprite(resources.plant, 1, [1], GameplayGraphics),
    }, { startingSpriteKey: 'normal' });

    this.light = new Light(
      this.position.x + 3.5, this.position.y + 4,
      40,
      r, g, b, 1,
    );
    this.lit = false;
  }

  render(camera) {
    this.renderSprite(camera);
    if (this.lit) {
      this.light.render(camera);
    }
  }

  update(elapsedTime) {
    this.updateInternalStructure(elapsedTime);
    this.light.x = this.position.x + 3.5;
    this.light.y = this.position.y + 4;
  }

  lightUp() {
    this.lit = true;
  }
}

export default Plant;
