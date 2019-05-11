'use strict';

class Vector {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;
    }
    plus(vector) {
        if(!(vector instanceof Vector)) {
            throw new Error('Можно прибавлять к вектору только вектор типа Vector') ;
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    times(multiplier) {
        return new Vector(this.x * multiplier, this.y * multiplier);
    }
}

class Actor {
    constructor(pos = new Vector(), size = new Vector(1,1), speed = new Vector()) {
        if(!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
            throw new Error('Не является объектом типа Vector') ;
        }
        this.pos = pos;
        this.size = size;
        this.speed = speed;
        this.act = () => {}

        // TODO Должны быть определены свойства только для чтения left, top, right, bottom, в которых установлены границы объекта по осям X и Y с учетом его расположения и размера.
        this._left = pos.x;
        this._top = pos.y;
        this._right = pos.x + size.x;
        this._bottom = pos.y + size.y;

        this._type = 'actor';
    }

    get left() {
        return this._left;
    }
    get top() {
        return this._top;
    }
    get right() {
        return this._right;
    }
    get bottom() {
        return this._bottom;
    }
    get type () {
        return this._type;
    }

    isIntersect(actor) {
        if(!(actor instanceof Actor)) {
            throw new Error('Не является объектом типа Actor') ;
        }

        if(actor === this) {
            return false;
        }

        // Объект равен объекту (лежит один в один)
        if(actor.top === this.top && actor.left === this.left && actor.bottom === this.bottom && actor.right === this.right) {
            return true;
        // Объект пересекается с объектом, который полностью содержится в нём
        } else if(actor.top > this.top && actor.left > this.left && actor.bottom < this.bottom && actor.right < this.right) {
            return true;
        // Объект пересекается с объектом, который частично содержится в нём
        } else if(actor.right > this.left && actor.left < this.right && actor.bottom > this.top && actor.top < this.bottom) {
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
        this.height = grid.length ;
        this.width = this._getGridWidth(grid);
        this.status = null;
        this.finishDelay = 1;
    }

    _getGridWidth(grid){
        if(!grid.length) {
            return 0;
        }
        let longestGrid = grid.reduce((acc, next) => {
            return acc.length < next.length ?  next : acc;
        }, [])

        return longestGrid.length;
    }

    isFinished() {
        if(this.status && this.finishDelay < 0) {
            return true;
        } else {
            return false;
        }
    }

    actorAt(actor) {
        if(!actor || !(actor instanceof Actor)) {
            throw new Error('В метод actorAt передан не верный объект!');
        }

        const intersectedActor = this.actors.filter(item => actor.isIntersect(item));
        if(intersectedActor.length) {
            return intersectedActor[0];
        } else {
            return undefined;
        }
    }  
    
    // препятствие на
    obstacleAt(position, size) {
        if(!(position instanceof Vector) || !(size instanceof Vector)) {
            throw new Error('В метод obstacleAt передан(ы) не верны(й/е) объект(ы)!');
        }

        if(Math.floor(position.x) === 0 && Math.floor(position.y) === 0) {
            return this.grid[0][0];
        }

        if(position.x < 0) {
            return 'wall';
        }

        if(position.y >= this.height) {
            return 'lava';
        }

        if(position.y < 0) {
            return 'wall';
        }

        if(position.x >= this.width) {
            return 'wall'
        }
    }
}