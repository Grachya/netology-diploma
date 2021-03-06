'use strict';

const OBSTACLE_TYPES = {
  WALL: 'wall',
  LAVA: 'lava',
}

const ACTOR_TYPES = {
  PLAYER: 'player',
  ACTOR: 'actor',
  FIREBALL: 'fireball',
  COIN: 'coin',
}

const GAME_STATUS = {
  LOST: 'lost',
  WON: 'won',
}

const OBSTACLE_SYMBOLS = {
  'x': OBSTACLE_TYPES.WALL,
  '!': OBSTACLE_TYPES.LAVA,
};

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!Vector.isVector(vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }
  times(multiplier) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }

  static isVector(obj) {
    return obj instanceof Vector;
  }
}

class Actor {
  constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
    if (!Vector.isVector(pos) || !Vector.isVector(size) || !Vector.isVector(speed)) {
      throw new Error('Не является объектом типа Vector');
    }
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }

  act() { }

  get left() {
    return this.pos.x;
  }
  get top() {
    return this.pos.y;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  get type() {
    return ACTOR_TYPES.ACTOR;
  }

  isIntersect(actor) {
    if (!Actor.isActor(actor)) {
      throw new Error('Не является объектом типа Actor');
    }

    if (actor === this) {
      return false;
    }

    // Объект равен объекту (лежит один в один)
    if (actor.top === this.top && actor.left === this.left && actor.bottom === this.bottom && actor.right === this.right) {
      return true;
      // Объект пересекается с объектом, который полностью содержится в нём
    } else if (actor.top > this.top && actor.left > this.left && actor.bottom < this.bottom && actor.right < this.right) {
      return true;
      // Объект пересекается с объектом, который частично содержится в нём
    } else if (actor.right > this.left && actor.left < this.right && actor.bottom > this.top && actor.top < this.bottom) {
      return true;
    } else {
      return false;
    }
  }

  static isActor(obj) {
    return obj instanceof Actor;
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player =  this.actors.find(actor => actor.type === ACTOR_TYPES.PLAYER);
    this.height = grid.length;
    this.status = null;
    this.finishDelay = 1;
  }

  get width() {
    return this.grid.reduce((width, line) => {
      return line.length > width ? line.length : width;
    }, 0);
  }

  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }

  actorAt(actor) {
    if (!Actor.isActor(actor)) {
      throw new Error('В метод actorAt передан не верный объект!');
    }

    return this.actors.find(item => item.isIntersect(actor));
  }

  // препятствие на
  obstacleAt(position, size) {
    if (!Vector.isVector(position) || !Vector.isVector(size)) {
      throw new Error('В метод obstacleAt передан(ы) не верны(й/е) объект(ы)!');
    }

    const actor = new Actor(position, size);

    if (actor.top < 0 || actor.left < 0 || actor.right > this.width - 1) {
      return OBSTACLE_TYPES.WALL;
    }

    if (actor.bottom > this.height - 1) {
      return OBSTACLE_TYPES.LAVA;
    }

    for (let y = Math.floor(actor.top); y < Math.ceil(actor.bottom); y++) {
      for (let x = Math.floor(actor.left); x < Math.ceil(actor.right); x++) {
        const cell = this.grid[y][x];
        if (Object.values(OBSTACLE_TYPES).includes(cell)) {
          return cell;
        }
      }
    }
  }

  removeActor(actor) {
    this.actors = this.actors.filter(item => item !== actor);
  }

  noMoreActors(actorType) {
    return !this.actors.some(item => item.type === actorType)
  }

  playerTouched(type, actor = new Actor()) {
    if (this.status) {
      return;
    }

    if (type === OBSTACLE_TYPES.LAVA || type === ACTOR_TYPES.FIREBALL) {
      this.status = GAME_STATUS.LOST;
    }

    if (type === ACTOR_TYPES.COIN) {
      this.removeActor(actor);
      if (this.noMoreActors(type)) {
        this.status = GAME_STATUS.WON;
      }
    }
  }
}

class LevelParser {
  constructor(actors) {
    this.actors = actors;
  }

  actorFromSymbol(symbol) {
    if (symbol) {
      return this.actors[symbol];
    }
  }

  obstacleFromSymbol(symbol) {
    return OBSTACLE_SYMBOLS[symbol];
  }

  createGrid(gridArray) {
    return gridArray.map(string => [...string].map(this.obstacleFromSymbol));
  }

  createActors(actorsArray) {
    if (!actorsArray.length || !this.actors) {
      return [];
    }

    const createdActors = actorsArray.map((item, i) => {
      const splited = item.split('');

      const transformed = splited.map((actor, k) => {
        let createdActor;
        const Constructor = this.actorFromSymbol(actor);

        if (Constructor && typeof Constructor === 'function') {
          createdActor = new Constructor(new Vector(k, i));
        }
        
        if (Actor.isActor(createdActor)) {
          return createdActor;
        }
      })

      const filtered = transformed.filter(item => item);

      return filtered;
    })

    return [].concat(...createdActors);
  }

  parse(obstacleArray) {
    const actorsArray = this.createActors(obstacleArray)
    const gridArray = this.createGrid(obstacleArray)
    return new Level(gridArray, actorsArray);
  }
}

class Fireball extends Actor {
  constructor(position, speed) {
    super(position, undefined, speed)
  }

  get type () {
    return ACTOR_TYPES.FIREBALL;
  }

  get isSpeedZero () {
    return this.speed.x === 0 && this.speed.y === 0;
  }

  getNextPosition(time = 1) {
    if (this.isSpeedZero) {
      return this.pos;
    }

    if (time) {
      let newSpeed = new Vector(this.speed.x, this.speed.y)
      newSpeed = newSpeed.times(time);
      return this.pos.plus(newSpeed);
    }
    return this.pos.plus(this.speed);
  }

  handleObstacle() {
    this.speed = this.speed.times(-1)
  }

  act(time, grid) {
    const nextPosition = this.getNextPosition(time);
    const isIntersectObstacle = grid.obstacleAt(nextPosition, this.size);
    if (!isIntersectObstacle) {
      this.pos = nextPosition;
    } else {
      this.handleObstacle();
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(position) {
    super(position, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(position) {
    super(position, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(position) {
    super(position, new Vector(0, 3));
    this.initPosition = new Vector(this.pos.x, this.pos.y);
  }
  handleObstacle () {
    this.pos = this.initPosition;
  }
}

class Coin extends Actor {
  constructor(position) {
    super(position, new Vector(0.6, 0.6));
    this.pos = this.pos.plus(new Vector(.2, .1));
    this.initPosition = this.pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.floor(Math.random() * 2 * Math.PI) + 0;
  }

  get type() {
    return ACTOR_TYPES.COIN;
  }

  updateSpring(time = 1) {
    this.spring = this.spring + (this.springSpeed * time);
  }

  getSpringVector() {
      return new Vector(undefined, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);    
    const springVector = this.getSpringVector();

    return this.initPosition.plus(springVector);
  }

  act(time) {
    const nextPosition = this.getNextPosition(time);
    this.pos = nextPosition;
  }
}

class Player extends Actor {
  constructor(position = new Vector()) {
    const playerPosition = position.plus(new Vector(0, -0.5));
    super(playerPosition, new Vector(0.8, 1.5))
  }

  get type() {
    return ACTOR_TYPES.PLAYER;
  }
}

const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
}

const parser = new LevelParser(actorDict);

const levels = loadLevels();
levels.then((levels) => {
  console.log(JSON.parse(levels));
  runGame(JSON.parse(levels), parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
})




