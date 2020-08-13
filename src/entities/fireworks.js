import Entity from '../../engine/entity.js';
import Sprite from '../../engine/sprite.js';
import { resources } from '../../engine/resources.js';
import { GameplayGraphics } from '../../engine/rendering.js';

class FireWorks extends Entity {
  constructor() {
    super({
      normal: new Sprite(resources.fireworks, 22, 100, GameplayGraphics),
    }, { startingSpriteKey: 'normal' });
  }
}

export default FireWorks;
