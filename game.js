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

        if(actor.top === this.top && actor.left === this.left && actor.bottom === this.bottom && actor.right === this.right) {
            return true;
        } else if(actor.top > this.top && actor.left > this.left && actor.bottom < this.bottom && actor.right < this.right) {
            return true;
        } else {
            return false;
        }

        // if(actor.left > this.right || actor.right < this.left || actor.top < this.bottom || actor.bottom > this.top) {
        //     return false;
        // } else if(actor.top === this.top && actor.left === this.left && actor.bottom === this.bottom && actor.right === this.right) {
        //     return true;
        // } else {
        //     return true;
        // }
    }
}


// bool Intersects(Rectangle r1, Rectangle r2){
//     if(r1.left > r2.right || r1.right < r2.left || r1.top < r2.bottom || r1.bottom > r2.top) return false;
//     return true;
//   }