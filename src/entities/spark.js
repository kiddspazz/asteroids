import { rotate } from '../utils';

class Spark {
  constructor(point, d) {
    this.point = { ...point };
    const x = Math.floor((Math.random() * 30) + 15);
    this.timeLimit = x;
    this.v = rotate({ x: 0, y: Math.random() * 3 - 4 }, d);
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.point.x, this.point.y);
    ctx.lineTo(this.point.x + 2, this.point.y + 2);
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
  }

  update(explosion) {
    this.point.x += this.v.x;
    this.point.y += this.v.y;
    this.timeLimit -= 1;
    if (this.timeLimit < 0) { explosion.splice(0, 1); }
  }
}

export default Spark;
