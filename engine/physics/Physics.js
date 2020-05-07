class Physics {
  static buildJumpMovement(initialVelocityY, acceleration) {
    return function processJump(x, y, velocity, elapsedTime) {
      velocity.y = (velocity.y || initialVelocityY) - acceleration * elapsedTime;
      const newY = y - velocity.y;
      return [x, newY];
    };
  }
}

export default Physics;
