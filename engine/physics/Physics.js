class Physics {
  static buildJumpMovement(initialVelocityY, acceleration) {
    return function processJump(position, velocity, elapsedTime) {
      velocity.y = (velocity.y || initialVelocityY) - acceleration * elapsedTime;
      position.y -= velocity.y;
    };
  }

  static buildJumpMovement2(v0) {
    const g = 0.25;
    let y0 = null;
    return function processJump(position, t) {
      if (t === 0) y0 = position.y;
      position.y = y0 - v0 * t + 0.5 * g * (t ** 2);
    };
  }

  static boundContains(bound, point) {
    return bound.x < point.x && bound.x + bound.width > point.x
    && bound.y < point.y && bound.y + bound.height > point.y;
  }

  static get origin() {
    return { x: 0, y: 0 };
  }
}

export default Physics;
