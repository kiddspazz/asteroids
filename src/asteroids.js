// TODO: refactor with vectors
import * as firebase from 'firebase/app';
import database from 'firebase/database';
import Asteroid from './modules/asteroid';
import Bullet from './modules/bullet';
import Spark from './modules/spark';
import Ship from './modules/ship';
import config from './config';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: 'asteroids-1e3b1.firebaseapp.com',
  databaseURL: 'https://asteroids-1e3b1.firebaseio.com',
  projectId: 'asteroids-1e3b1',
  storageBucket: '',
  messagingSenderId: '591801633463',
};
firebase.initializeApp(firebaseConfig);

const div = document.getElementById('canvasDiv');
const c = document.createElement('canvas');
div.appendChild(c);
c.width = config.width;
c.height = config.height;
c.style = 'border: 1pt black solid; background-color: black';
const ctx = c.getContext('2d');

const getHighScore = () => {
  database.ref('highScore').once('value').then((snapshot) => snapshot.val());
};
const getHighScorer = () => {
  database.ref('user').once('value').then((snapshot) => snapshot.val());
};

let score = 0;
let level = 1;
let gameOver = false;
let entities = [];
let explosion = [];
let highScore = getHighScore();
let highScorer = getHighScorer();

// this should trigger on collision with ship
const makeExplosion = (point) => {
  const sparks = Math.floor((Math.random() * 45) + 20);
  for (let i = 0; i < sparks; i += 1) {
    const d = 360 - (i * (360 / sparks));
    explosion.push(new Spark(point, d));
  }
};

const collision = (array) => {
  // TODO: refactor this mess
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

  removeThese = removeThese.filter(onlyUnique).sort((a, b) => a - b);

  for (let i = 0; i < removeThese.length; i += 1) {
    const arrayNumber = removeThese[i] - i;
    array[arrayNumber].ifCollision(array, arrayNumber);
  }
};

const Placement = () => {
  const midWidth = c.width / 2;
  const midHeight = c.height / 2;
  this.x = Math.random() * c.width;
  if (
    this.x > (midWidth - (config.asteroidStartSize + 10))
    && this.x < (midWidth + (config.asteroidStartSize + 10))
  ) { this.x = 0; }
  this.y = Math.random() * c.height;
  if (
    this.y > (midHeight - (config.asteroidStartSize + 10))
    && this.y < (midHeight + (config.asteroidStartSize + 10))
  ) { this.y = 0; }
};

(() => {
  // TODO; reset highScore as soon as you get past it
  const tick = () => {
    collision(entities);
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.font = '12px helvetica';
    ctx.fillText(`score: ${Math.floor(score)}`, 2, 12);
    ctx.fillText(`level: ${level}`, 2, 36);
    ctx.fillText(`HIGH score: ${Math.floor(highScore)}`, 2, 596);
    ctx.fillText(highScorer, 110, 596);
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
      if (Math.floor(score) > Math.floor(highScore)) {
        highScore = Math.floor(score);
        if (!gameOver) {
          highScorer = prompt('initials: ', '...');
          database.ref('user').set(highScorer);
        }
      }
      gameOver = true;
    }
    for (let i = 0; i < entities.length; i += 1) {
      entities[i].draw(ctx);
      entities[i].update(entities);
    }
    for (let i = 0; i < explosion.length; i += 1) {
      explosion[i].draw(ctx);
      explosion[i].update(explosion);
    }
    const asteroids = entities.reduce((tot, cur) => {
      if (cur instanceof Asteroid) { return tot + 1; } return tot;
    }, 0);
    if (asteroids < 1) {
      level += 1;
      for (let i = 0; i < level; i += 1) {
        const p = new Placement();
        const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
        entities.push(new Asteroid(config.asteroidStartSize, p.x, p.y, newV));
      }
    }
    window.requestAnimationFrame(tick);
  };

  window.addEventListener('keydown', (e) => {
    if ([37, 38, 39, 40, 32].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  }, false);

  const newGame = () => {
    score = 0;
    level = 1;
    gameOver = false;
    entities = [];
    explosion = [];
    entities.push(new Ship(3, 255));
    for (let i = 0; i < level; i += 1) {
      const p = new Placement();
      const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
      entities.push(new Asteroid(config.asteroidStartSize, p.x, p.y, newV));
    }

    const restart = document.getElementById('restart');

    restart.onclick = newGame;

    entities.push(new Ship(3, 255));
    for (let i = 0; i < level; i += 1) {
      const p = new Placement();
      const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
      entities.push(new Asteroid(config.asteroidStartSize, p.x, p.y, newV));
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
