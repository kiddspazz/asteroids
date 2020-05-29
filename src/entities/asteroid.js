import { rotate, vector } from '../utils';

const addThreeNewAsteroids = (array, i) => {
  for (let j = 0; j < 3; j += 1) {
    const newRadius = array[i].r / 2;
    const d = 360 - (j * (360 / 3)) - Math.random() * 120;
    const newCenter = {
      x: rotate({ x: 0, y: -30 }, d).x + array[i].x,
      y: rotate({ x: 0, y: -30 }, d).y + array[i].y,
    };
    const velocity = -Math.random() * (Math.sqrt(14 / (newRadius * 2)));
    const newVector = rotate({ x: 0, y: velocity }, d);
    array.push(new Asteroid(newRadius, newCenter.x, newCenter.y, newVector));
  }
};

export default class Asteroid {
  constructor(radius, x, y, vector) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vector = vector;
    this.sides = [{}, {}, {}, {}, {}, {}, {}, {}];

    for (let i = 0; i < this.sides.length; i += 2) {
      const offsetFromLastSide = i > 0 ? this.sides[i - 1].length : 0;

      this.sides[i] = {
        length: ((Math.random() * 0.0625 + 0.0625)) * 360 + offsetFromLastSide,
        angle: ((Math.random() - 0.5) * (this.angle / 4)) + this.angle,
      };

      this.sides[i + 1] = {
        length: (((i / 2) + 1) * 0.25 * 360),
        angle: ((Math.random() - 0.5) * (this.angle / 4)) + this.angle,
      };
    }

    this.sides[7].angle = radius;
  }

  draw(ctx) {
    const {
      x,
      y,
      radius,
      sides,
    } = this;
    const thisSide = { x: 0, y: radius };
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    for (let i = 0; i < sides.length; i += 1) {
      thisSide.x = rotate({ x: 0, y: sides[i].angle }, sides[i].length).x;
      thisSide.y = rotate({ x: 0, y: sides[i].angle }, sides[i].length).y;
      ctx.lineTo(thisSide.x + x, thisSide.y + y);
    }
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
  }

  update(state) {
    this.x += this.vector.x;
    this.y += this.vector.y;

    if (this.x > state.width) { this.x = 0; }
    if (this.x < 0) { this.x = state.width; }
    if (this.y > state.height) { this.y = 0; }
    if (this.y < 0) { this.y = state.height; }
  }

  // TODO: rewrite all entities as strategy design patterns
  // TODO: handle score logic from somewhere higher
  static ifCollision(array, i) {
    const smallestAllowedAsteroid = 10;
    if (array[i].r > smallestAllowedAsteroid) {
      addThreeNewAsteroids(array, i);
    }
    array.splice(i, 1);
  }
}
