export default class Entity {
  constructor(drawStrat, collisionStrat) {
    this.drawStrategy = drawStrat;
    this.collisionStrategy = collisionStrat;
  }

  draw(ctx) {
    this.drawStrategy(ctx);
  }

  handleCollision(secondEntity) {
    this.collisionStrategy(secondEntity);
  }
}
