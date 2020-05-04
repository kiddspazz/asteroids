import { rotate } from '../utils';
import Bullet from './bullet';
import Asteroid from './asteroid';

const Keyboarder = () => {
  const keyState = {};

  window.onkeydown = (e) => {
    keyState[e.keyCode] = true;
  };

  window.onkeyup = (e) => {
    keyState[e.keyCode] = false;
  };

  this.isDown = (keyCode) => keyState[keyCode] === true;

  this.KEYS = {
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, SPACE: 32,
  };
};

export default class Ship {
  constructor(lives, color) {
    this.lives = lives;
    this.center = { x: 600 / 2, y: 600 / 2 };
    this.degreesFromNorth = 0;
    this.vector = { x: 0, y: 0 };
    this.keyboarder = new Keyboarder();
    this.color = color;
  }

  draw(ctx) {
    const { d, c: { x, y } } = this;

    // Draw isosceles triangle pointing in degreesFromNorth d (out of 360).
    let forwardPoint = { x: 0, y: -10 };
    let backLeftPoint = { x: -5, y: 5 };
    let backRightPoint = { x: 5, y: 5 };
    let backwardPoint = { x: 0, y: 2 };

    forwardPoint = rotate(forwardPoint, d);
    backwardPoint = rotate(backwardPoint, d);
    backLeftPoint = rotate(backLeftPoint, d);
    backRightPoint = rotate(backRightPoint, d);

    ctx.beginPath();
    ctx.moveTo(x + backLeftPoint.x, y + backLeftPoint.y);
    ctx.lineTo(x + forwardPoint.x, y + forwardPoint.y);
    ctx.lineTo(x + backRightPoint.x, y + backRightPoint.y);
    ctx.lineTo(x + backwardPoint.x, y + backwardPoint.y);
    ctx.lineTo(x + backLeftPoint.x, y + backLeftPoint.y);
    ctx.strokeStyle = `rgb(${this.color},255,255)`;
    ctx.stroke();
  }

  update(entities) {
    const { x, y } = this.center;
    // if the right/left keys are down, increase/decrease this.d
    if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
      this.degreesFromNorth -= 4;
    }

    if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
      this.degreesFromNorth += 4;
    }

    // if the up/down keys are down, increase/decrease this.v
    const d = this.degreesFromNorth * (Math.PI / 180);

    if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
      this.vector.x += (1 / 10) * (Math.sin(d));
      this.vector.y += (-1 / 10) * (Math.cos(d));

      if (vLength(this.vector) > 2) {
        this.vector.x = max2(this.vector).x;
        this.vector.y = max2(this.vector).y;
      }
    }

    if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
      this.vector.x -= Math.sign(this.vector.x) * 0.02;
      this.vector.y -= Math.sign(this.vector.y) * 0.02;

      if (Math.floor(vLength(this.vector)) === 0) {
        this.vector.x = 0;
        this.vector.y = 0;
      }

      if (vLength(this.vector) > 2) {
        this.vector.x = max2(this.vector).x;
        this.vector.y = max2(this.vector).y;
      }
    }

    // add v to this.x and this.y
    this.center.x += this.vector.x;
    if (this.center.x > 600) { this.center.x = 0; }
    if (this.center.x < 0) { this.center.x = 600; }
    this.center.y += this.vector.y;
    if (this.center.y > 600) { this.center.y = 0; }
    if (this.center.y < 0) { this.center.y = 600; }

    // bullets!
    const bulletCenter = { x, y };
    if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
      const bullets = entities.reduce((tot, cur) => ((cur instanceof Bullet) ? tot + 1 : tot), 0);
      if (this.color === 0) {
        entities.push(new Bullet(d, bulletCenter));
      } else if (bullets < 40) {
        entities.push(new Bullet(d, bulletCenter));
      }
    }

    const asteroids = entities.reduce((tot, cur) => {
      if (cur instanceof Asteroid) { return tot + 1; } return tot;
    }, 0);
    if (asteroids < 1) { this.color = Math.max(this.color - 90, 0); }
  }

  ifCollision(array) {
    const livesAfterThisCollision = this.lives - 1;
    array.splice(0, 1);
    if (livesAfterThisCollision > 0) {
      entities.unshift(new Ship(livesAfterThisCollision, 255));
    }
    const point = { x: this.center.x, y: this.center.y };

    makeExplosion(point);
  }
}
