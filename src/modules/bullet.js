import config from '../config';

class Bullet {
  constructor(vector, center) {
    this.vector = vector;
    this.center = center;
  }

  draw(ctx) {
    const tip = {
      x: this.center.x + 10 * Math.sin(this.vector),
      y: this.center.y + -10 * Math.cos(this.vector),
    };
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(tip.x + 1, tip.y);
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
  }

  update(entities) {
    // move in the direction i was going.
    this.center.x += 5 * Math.sin(this.vector);
    this.center.y += -5 * Math.cos(this.vector);

    if (this.center.x > config.width
      || this.center.x < 0
      || this.center.y > config.height
      || this.center.y < 0
    ) { entities.splice(entities.indexOf(this), 1); }
  }

  static ifCollision(entities, j) {
    entities.splice(j, 1);
  }
}

export default Bullet;
