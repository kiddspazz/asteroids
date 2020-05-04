import config from './config/config.json'; 
import Asteroid from './entities/asteroid';
import Bullet from './entities/bullet';
import Spark from './entities/spark';
import Ship from './entities/ship';
import { setupFirebase } from './utils.js';
// Add the Firebase services that you want to use.
import 'firebase/database';

const database = setupFirebase(process.env.APIKEY).database();
const ctx = document.getElementById('board').getContext('2d');

window.onload = () => {
  window.addEventListener('keydown', (e) => {
    if ([37, 38, 39, 40, 32].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
  }, false);

  const restart = document.getElementById('restart');
  restart.onclick = initNewGame();

  initNewGame(ctx);
}

const initNewGame = () => {
  const gameState = {
    score: 0,
    level: 1,
    gameOver: false,
    entities: [],
    explosion: [],
    highScore: getHighScore(),
    highScorer: getHighScorer(),
  };

  entities.push(new Ship(3, 255));
  const p = new Placement();
  const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
  entities.push(new Asteroid(config.asteroidStartSize, p.x, p.y, newV));
  tick();
};

const getHighScore = () => {
  database.ref('highScore').once('value').then((snapshot) => snapshot.val());
};
const getHighScorer = () => {
  database.ref('user').once('value').then((snapshot) => snapshot.val());
};

const tick = () => {
  let { entities, highScore, highScorer, score } = gameState;

  if (score > highScore) {
    highScore = score;
    highScorer = '';
  }

  updateEntities(entities);
  if (asteroids < 1) {
    initNewLevel(entites, level);
  }
  drawBoard(ctx);
  printStatus(gameState);
  drawEntites(entities);

  window.requestAnimationFrame(tick);
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

const drawBoard = (context) => {
  // clear board
  context.fillStyle = 'rgb(0,0,0)';
  context.fillRect(0, 0, c.width, c.height);
  context.fillStyle = 'rgb(255,255,255)';

  // print info
  context.font = '12px helvetica';
  context.fillText(`score: ${Math.floor(score)}`, 2, 12);
  context.fillText(`level: ${level}`, 2, 36);
  context.fillText(`HIGH score: ${Math.floor(highScore)}`, 2, 596);
  context.fillText(highScorer, 110, 596);
};

const printStatus = ({
  entities,
  score,
  level
}) => {
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
};

const updateEntites = (entities) => {
  entities.forEach((entity) => {
    if (!entity.hasCollided) {
      // check if this entity is colliding with any other entity
      // if so set entity.hasCollided = true
      if (entity.isColliding(entities)) {
        entity.hasCollided = true;
      }
    }
  });

  entites.filter((e) => e.hasCollided).forEach((e) => e.handleCollision());

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
}

const initNewLevel = (entities, level) => {
  level += 1;
  for (let i = 0; i < level; i += 1) {
    const p = new Placement();
    const newV = { x: Math.random() * 0.5, y: Math.random() * 0.5 };
    entities.push(new Asteroid(config.asteroidStartSize, p.x, p.y, newV));
  }
};

// this should trigger on ship collision
const makeExplosion = (point) => {
  const sparks = Math.floor((Math.random() * 45) + 20);
  for (let i = 0; i < sparks; i += 1) {
    const d = 360 - (i * (360 / sparks));
    explosion.push(new Spark(point, d));
  }
};

