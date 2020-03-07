import { GameplayGraphics } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';
import Sprite from '../engine/sprite.js';

let heroSprite = null;

let gravity = hero => Math.max(0.05, -hero.velocityVector * 0.25);

class Hero {
  constructor(
    gravityBreakRate = 0.25,
    normalPropulsion = 0.1,
    propulsionBreakRate = 0.25,
    normalGravity = 0.05,
    maxPropulsionSpeed = 1.5, maxFallSpeed = 2,
  ) {
    this.x = 30;
    this.y = 10;
    this.width = 10;
    this.height = 10;
    this.velocityVector = 0;
    this.getPropulsion = () => 0;

    this.gravityBreakRate = gravityBreakRate;
    this.normalPropulsion = normalPropulsion;
    this.propulsionBreakRate = propulsionBreakRate;
    this.normalGravity = normalGravity;
    this.maxPropulsionSpeed = maxPropulsionSpeed;
    this.maxFallSpeed = maxFallSpeed;
  }

  propulse() {
    this.getPropulsion = () => Math.max(
      this.velocityVector * this.gravityBreakRate, this.normalPropulsion,
    );
    gravity = () => this.normalGravity;
  }

  fall() {
    this.getPropulsion = () => 0;
    gravity = () => Math.max(this.normalGravity, -this.velocityVector * this.propulsionBreakRate);
  }

  update() {
    this.velocityVector = this.velocityVector + gravity(this) - this.getPropulsion();

    if (this.velocityVector < -this.maxPropulsionSpeed) {
      this.velocityVector = -this.maxPropulsionSpeed;
    }
    if (this.velocityVector > this.maxFallSpeed) {
      this.velocityVector = this.maxFallSpeed;
    }

    // Use final velocity
    this.y += this.velocityVector;


    if (heroSprite === null) {
      heroSprite = new Sprite(resources.tryImage, 2, [4, 4], GameplayGraphics);
      this.width = heroSprite.image.width;
      this.height = heroSprite.image.height;
    } else {
      heroSprite.update();
    }
  }

  render(camera) {
    heroSprite.render(this.x - camera.x, this.y - camera.y);
  }
}

export default Hero;
