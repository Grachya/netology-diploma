'use strict';

const OBSTACLE_TYPES = {
  WALL: 'wall',
  LAVA: 'lava',
}

const ACTOR_TYPES = {
  PLAYER: 'player',
  ACTOR: 'actor',
}

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
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
    if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
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
    // TODO вынести в константу
    return ACTOR_TYPES.ACTOR;
  }

  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
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
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    //TODO возможно что это не нулевой элемент, а нужно искать через find и instanseof Player;
    this.player = actors[0];
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
    if (this.status && this.finishDelay < 0) {
      return true;
    } else {
      return false;
    }
  }

  actorAt(actor) {
    if (!actor || !(actor instanceof Actor)) {
      throw new Error('В метод actorAt передан не верный объект!');
    }

    const intersectedActor = this.actors.filter(item => actor.isIntersect(item));
    if (intersectedActor.length) {
      return intersectedActor[0];
    } else {
      return undefined;
    }
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

    // TODO возможно >=
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
    this.actors.forEach((item, i) => {
      if (item === actor) {
        this.actors.splice(i, 1);
      }
    })
  }

  noMoreActors(actorType) {
    const findedActor = this.actors.find(item => item.type === actorType);
    if (findedActor) {
      return false;
    } else {
      return true;
    }
  }

  playerTouched(type, actor = new Actor()) {
    if (this.status) {
      return;
    }

    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }

    if (type === 'coin') {
      this.removeActor(actor);
      if (this.noMoreActors(type)) {
        this.status = 'won';
      }
    }
  }
}

class Player extends Actor {
  constructor(position = new Ve) {
    const playerPosition = position.plus(new Vector(0, -0.5));
    super(playerPosition, new Vector(0.8, 1.5))
  }

  get type() {
    return ACTOR_TYPES.PLAYER;
  }
}
