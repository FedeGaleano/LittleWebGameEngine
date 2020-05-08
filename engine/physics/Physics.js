class Physics {
  static buildJumpMovement(initialVelocityY, acceleration) {
    return function processJump(position, velocity, elapsedTime) {
      velocity.y = (velocity.y || initialVelocityY) - acceleration * elapsedTime;
      position.y -= velocity.y;
    };
  }
}

export default Physics;
