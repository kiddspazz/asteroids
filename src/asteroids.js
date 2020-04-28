import * as firebase from 'firebase/app';
import database from 'firebase/database';
import rotate from './modules/rotate';

// Initialize Firebase
const config = {
  apiKey: process.env.APIKEY,
  authDomain: 'asteroids-1e3b1.firebaseapp.com',
  databaseURL: 'https://asteroids-1e3b1.firebaseio.com',
  projectId: 'asteroids-1e3b1',
  storageBucket: '',
  messagingSenderId: '591801633463',
};
firebase.initializeApp(config);

const WIDTH = 600;
const HEIGHT = 600;
const ASTEROID_START_SIZE = WIDTH / 14;
let score = 0;
let level = 1;
let end = 1;
let entities = [];
let explosion = [];
let user = '';

const div = document.getElementById('canvasDiv');
const c = document.createElement('canvas');
const ctx = c.getContext('2d');
div.appendChild(c);
c.width = WIDTH;
c.height = HEIGHT;
c.style = 'border: 1pt black solid; background-color: black';

const getHighScore = () => {
  database.ref('highScore').once('value').then((snapshot) => {
    highScore = snapshot.val();
  });
  database.ref('user').once('value').then((snapshot) => {
    user = snapshot.val();
  });
};

let highScore = getHighScore();

class Asteroid {
  constructor(radius, x, y, vector) {
    this.x = x;
    this.y = y;
    this.r = radius;
    this.vector = vector;
    this.d = Math.random() * 360;
    this.sides = [{}, {}, {}, {}, {}, {}, {}, {}];

    for (let i = 0; i < this.sides.length; i += 2) {
      const offsetLastSide = i > 0 ? this.sides[i - 1].length : 0;

      this.sides[i] = {
        length: ((Math.random() * 0.0625 + 0.0625)) * 360 + offsetLastSide,
        angle: ((Math.random() - 0.5) * (this.angle / 4)) + this.angle,
      };

      this.sides[i + 1] = {
        d: (((i / 2) + 1) * 0.25 * 360),
        angle: ((Math.random() - 0.5) * (this.angle / 4)) + this.angle,
      };
    }

    this.sides[7].angle = radius;
  }

  draw() {
    const {
      x,
      y,
      r,
      sides,
    } = this;
    const thisSide = { x: 0, y: r };
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    for (let i = 0; i < sides.length; i += 1) {
      thisSide.x = rotate({ x: 0, y: sides[i].r }, sides[i].d).x;
      thisSide.y = rotate({ x: 0, y: sides[i].r }, sides[i].d).y;
      ctx.lineTo(thisSide.x + x, thisSide.y + y);
    }
    ctx.strokeStyle = 'rgb(255,255,255)';
    ctx.stroke();
  }

  update() {
    this.x += this.vector.x;
    this.y += this.vector.y;
    this.d += Math.random() * 5;

    if (this.x > WIDTH) { this.x = 0; }
    if (this.x < 0) { this.x = WIDTH; }
    if (this.y > HEIGHT) { this.y = 0; }
    if (this.y < 0) { this.y = HEIGHT; }
  }

  // TODO: rewrite all entities as strategy design patterns
  ifCollision(array, i) {
    score += array[i].r;
    if (score > highScore) {
      highScore = Math.floor(score);
      database.ref('highScore').set(Math.floor(score));
    }
    if (array[i].r > 10) {
      for (let j = 0; j < 3; j += 1) {
        const newRadius = array[i].r / 2;
        const d = 360 - (j * (360 / 3)) - Math.random() * 120;
        const newCenter = {
          x: rotate({ x: 0, y: -30 }, d).x + array[i].x,
          y: rotate({ x: 0, y: -30 }, d).y + array[i].y,
        };
        const velocity = -Math.random() * (Math.sqrt(ASTEROID_START_SIZE / (newRadius * 2)));
        const newVector = rotate({ x: 0, y: velocity }, d);
        array.push(new Asteroid(newRadius, newCenter.x, newCenter.y, newVector));
      }
    }
    array.splice(i, 1);
  }
}

const Bullet = (d, c) => {
  this.d = d;
  this.c = c;
};

const makeExplosion = (point) => {
  const sparks = Math.floor((Math.random() * 45) + 20);
  for (i = 0; i < sparks; i++) {
    const d = 360 - (i * (360 / sparks));
    explosion.push(new Spark(point, d));
  }
};

const collision = (array) => {
  // if any of these collide with another, do entities[i].ifCollision().
  let removeThese = [];
  for (let i = 0; i < array.length; i += 1) {
    if (array[i] instanceof Asteroid) {
      for (let j = 0; j < array.length; j += 1) {
        // asteroid && bullet
        if (array[j] instanceof Bullet) {
          const pointMinusPoint = {
            x: array[i].x - array[j].c.x,
            y: array[i].y - array[j].c.y,
          };

          if (vLength(pointMinusPoint) <= array[i].r) {
            removeThese.push(i);
            removeThese.push(j);
          }
        }

        // asteroid && ship
        if (array[j] instanceof Ship) {
          const pointMinusPoint = {
            x: array[i].x - array[j].c.x,
            y: array[i].y - array[j].c.y,
          };

          if (vLength(pointMinusPoint) <= 5 + array[i].r) {
            removeThese.push(j);
          }
        }
      }
    }
  }

  const onlyUnique = (value, index, self) => self.indexOf(value) === index;

  removeThese = removeThese.filter(onlyUnique);

  removeThese = removeThese.sort((a, b) => a - b);

  for (let i = 0; i < removeThese.length; i++) {
    const arrayNumber = removeThese[i] - i;
    array[arrayNumber].ifCollision(array, arrayNumber);
  }
};

(() => {
  const tick = () => {
    collision(entities);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = '12px helvetica';
    ctx.fillText(`score: ${Math.floor(score)}`, 2, 12);
    ctx.fillText(`level: ${level}`, 2, 36);
    ctx.fillText(`HIGH score: ${Math.floor(highScore)}`, 2, 596);
    ctx.fillText(user, 110, 596);
    if (entities[0].lives === 1) { ctx.fillStyle = 'rgb(255,0,0)'; }
    if (entities[0].lives > 0) {
      ctx.fillText(`lives: ${entities[0].lives}`, 2, 24);
    } else {
      ctx.font = '48px helvetica';
      ctx.fillText('GAME OVER', c.width / 2 - 100, c.height / 2 - 20);
      ctx.fillText(`final score: ${Math.floor(score)}`, c.width / 2 - 200, c.height / 2 - 70);
      ctx.fillText(`level: ${level}`, c.width / 2 - 40, c.height / 2 - 120);
      ctx.font = '10px helvetica';
      ctx.fillText('Click restart button to restart', c.width / 2 - 80, c.height / 2);
      if (Math.floor(score) === Math.floor(highScore)) {
        if (end > 0) {
          user = prompt('initials: ', '...');
          database.ref('user').set(user);
        }
      }
      end = 0;
    }
    for (let i = 0; i < entities.length; i++) {
      entities[i].draw();
      entities[i].update();
    }
    for (let i = 0; i < explosion.length; i++) {
      explosion[i].draw();
      explosion[i].update();
    }
    const asteroids = entities.reduce((tot, cur) => {
      if (cur instanceof Asteroid) { return tot + 1; } return tot;
    }, 0);
    if (asteroids < 1) {
      level += 1;
      for (i = 0; i < level; i++) {
        const p = new Placement();
        const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
        entities.push(new Asteroid(ASTEROID_START_SIZE, p.x, p.y, newV));
      }
    }
    window.requestAnimationFrame(tick);
  };

  function Ship(lives, color) {
    this.lives = lives;
    this.c = { x: c.width / 2, y: c.height / 2 };
    this.d = 0;
    this.v = { x: 0, y: 0 };
    this.keyboarder = new Keyboarder();
    this.color = color;
  }

  Ship.prototype = {
    draw() {
      const { x } = this.c;
      const { y } = this.c;
      const { d } = this;

      // Draw isosceles triangle pointing in a direction (out of 360).
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
    },

    update() {
      const { x, y } = this.c;
      // if the right/left keys are down, increase/decrease this.d
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.d -= 4;
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.d += 4;
      }

      // if the up/down keys are down, increase/decrease this.v
      const d = this.d * (Math.PI / 180);

      if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
        this.v.x += (1 / 10) * (Math.sin(d));
        this.v.y += (-1 / 10) * (Math.cos(d));

        if (vLength(this.v) > 2) {
          this.v.x = max2(this.v).x;
          this.v.y = max2(this.v).y;
        }
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.DOWN)) {
        this.v.x = this.v.x - Math.sign(this.v.x) * 0.02;
        this.v.y = this.v.y - Math.sign(this.v.y) * 0.02;

        if (Math.floor(vLength(this.v)) === 0) {
          this.v.x = 0;
          this.v.y = 0;
        }

        if (vLength(this.v) > 2) {
          this.v.x = max2(this.v).x;
          this.v.y = max2(this.v).y;
        }
      }

      // add v to this.x and this.y
      this.c.x = this.c.x + this.v.x;
      if (this.c.x > c.width) { this.c.x = 0; }
      if (this.c.x < 0) { this.c.x = c.width; }
      this.c.y = this.c.y + this.v.y;
      if (this.c.y > c.height) { this.c.y = 0; }
      if (this.c.y < 0) { this.c.y = c.height; }

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
    },

    ifCollision(array, i) {
      const x = this.lives - 1;
      array.splice(0, 1);
      if (x > 0) {
        entities.unshift(new Ship(x, c));
      }
      const point = { x: this.c.x, y: this.c.y };

      makeExplosion(point);
    },
  };

  function Keyboarder() {
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
  }

  function vLength(v) {
    return Math.sqrt((v.x * v.x) + (v.y * v.y));
  }

  function max2(v) {
    const newV = { x: 0, y: 0 };
    if (vLength(v) > 2) {
      newV.x = v.x / (vLength(v) / 2);
      newV.y = v.y / (vLength(v) / 2);
    }
    return newV;
  }

  function Placement() {
    const midWidth = c.width / 2;
    const midHeight = c.height / 2;
    this.x = Math.random() * c.width;
    if (
      this.x > (midWidth - (ASTEROID_START_SIZE + 10))
      && this.x < (midWidth + (ASTEROID_START_SIZE + 10))
    ) { this.x = 0; }
    this.y = Math.random() * c.height;
    if (
      this.y > (midHeight - (ASTEROID_START_SIZE + 10))
      && this.y < (midHeight + (ASTEROID_START_SIZE + 10))
    ) { this.y = 0; }
  }

  function Spark(point, d) {
    this.point = { ...point };
    const x = Math.floor((Math.random() * 30) + 15);
    this.timeLimit = x;
    this.v = rotate({ x: 0, y: Math.random() * 3 - 4 }, d);
  }

  Spark.prototype = {
    draw() {
      ctx.beginPath();
      ctx.moveTo(this.point.x, this.point.y);
      ctx.lineTo(this.point.x + 2, this.point.y + 2);
      ctx.strokeStyle = 'rgb(255,255,255)';
      ctx.stroke();
    },
    update() {
      this.point.x += this.v.x;
      this.point.y += this.v.y;
      this.timeLimit--;
      if (this.timeLimit < 0) { explosion.splice(0, 1); }
    },
  };

  Bullet.prototype = {
    draw() {
      const tip = {
        x: this.c.x + (10) * (Math.sin(this.d)),
        y: this.c.y + (-10) * (Math.cos(this.d)),
      };
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(tip.x + 1, tip.y);
      ctx.strokeStyle = 'rgb(255,255,255)';
      ctx.stroke();
    },
    update() {
      // move in the direction i was going.
      this.c.x += (5) * (Math.sin(this.d));
      this.c.y = this.c.y + (-5) * (Math.cos(this.d));

      if (this.c.x > c.width
        || this.c.x < 0
        || this.c.y > c.height
        || this.c.y < 0
      ) { entities.splice(entities.indexOf(this), 1); }
    },
    ifCollision(array, j) {
      array.splice(j, 1);
    },
  };

  window.addEventListener('keydown', (e) => {
    if ([37, 38, 39, 40, 32].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  }, false);

  const newGame = () => {
    score = 0;
    level = 1;
    end = 1;
    entities = [];
    explosion = [];
    entities.push(new Ship(3, 255));
    for (let i = 0; i < level; i++) {
      const p = new Placement();
      const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
      entities.push(new Asteroid(ASTEROID_START_SIZE, p.x, p.y, newV));
    }

    const restart = document.getElementById('restart');

    restart.onclick = newGame;

    entities.push(new Ship(3, 255));
    for (let i = 0; i < level; i++) {
      const p = new Placement();
      const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
      entities.push(new Asteroid(ASTEROID_START_SIZE, p.x, p.y, newV));
    }

    tick();
  };

  newGame(c);

  window.addEventListener('keypress', (e) => {
    if (e.keyCode === 82) {
      newGame(c);
    }
  });
})();
