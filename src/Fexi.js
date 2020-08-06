import Entity from '../engine/entity.js';
import Sprite from '../engine/sprite.js';
import { resources } from '../engine/resources.js';
import { GameplayGraphics } from '../engine/rendering.js';

class Fexi extends Entity {
  constructor() {
    super(
      {
        idle: new Sprite(
          resources.character, 4, [100, 200, 100, 200], GameplayGraphics,
        ),
        run: new Sprite(
          resources.characterRunning, 4, [100, 100, 150, 100], GameplayGraphics,
        ),
        runInverse: new Sprite(
          resources.characterRunningInverse, 4, [100, 100, 150, 100], GameplayGraphics,
        ),
      }, { startingSpriteKey: 'idle' },
    );
  }
}

export default Fexi;
