"use strict"

const body = document.querySelector("body");
const framerate = 50;
const maxfishnum = 500;

class basefish {
    constructor(size = 1, position = [0, 0], direction = [1, 0], speed = 0) {
        this._size = size;
        this._position = position;
        this._direction = direction;
        this._speed = speed;
        this._element = null;
        this._type = 'basefish';
        this._imgsrc = '';
    }
    norm(vs) {
        let sum = 0;
        for (let v of vs) { sum += v * v }
        sum = Math.sqrt(sum);
        if (sum == 0) {
            throw ("err:divide by 0")
        }
        else {
            let rst = vs.map(v => v / sum);
            return rst;
        }
    }
    get type() { return this._type }
    get imgsrc() { return this._imgsrc }
    get element() { return this._element }
    set element(element) { this._element = element }
    get size() { return this._size }
    set size(size) { this._size = size }
    get position() { return this._position }
    set position(position) { this._position = position }
    get direction() { return this._direction }
    set direction(direction) { this._direction = norm(direction); }
    get speed() { return this._speed }
    set speed(speed) { this._speed = speed; }
    move() {
        this._position = [this._position[0] + this._direction[0] * this.speed, this._position[1] + this._direction[1] * this.speed];
    }
    get rotateangle() {
        if (this._direction[0] == 0) {
            if (this._direction[1] < 0)
                return [0, -90];
            else
                return [0, 90];
        }
        let angle = Math.atan(this._direction[1] / this._direction[0]) / Math.PI * 180;
        if (this._direction[0] < 0)
            return [180, -angle];
        else
            return [0, angle];
    }
}
class myfish extends basefish {
    constructor(size, position, direction, speed, health = 100, damp = 1, maxspeed = 10) {
        super(size, position, direction, speed);
        this._health = health;
        this._damp = damp;
        this._maxspeed = maxspeed;
        this._type = 'myfish';
        this._imgsrc = 'imgs/myfish.png';
    }
    get health() { return this._health }
    set health(health) { this._health = health }
    get maxspeed() { return this._maxspeed }
    set maxspeed(maxspeed) { this._maxspeed = maxspeed }
    get damp() { return this._damp }
    set damp(damp) {
        if (damp < 0) {
            throw ("err:negative damp");
        }
        else {
            this._damp = damp;
        }
    }
    move(target, speed) {
        if (target != null && !(Math.abs(target[0] - this.position[0]) < MinDistance && Math.abs(target[1] - this.position[1]) < MinDistance)) {
            let dir = super.norm([target[0], target[1]]);
            let newdir = [this._direction[0] * this._speed + dir[0] * speed, this._direction[1] * this._speed + dir[1] * speed];
            if (newdir[0] != 0 || newdir[1] != 0) {
                this._direction = super.norm(newdir);
            }
            this._speed = Math.sqrt(newdir[0] * newdir[0] + newdir[1] * newdir[1]);
        }
        this._speed = Math.min(this._speed, this._maxspeed);
        if (this._speed > this._damp)
            this._speed -= this._damp;
        else
            this._speed = 0;
        super.move();
    }

}
class littlefish extends basefish {
    constructor(size, position, direction) {
        super(size, position, direction, 0);
        this._maxspeed = 5 + Math.random();
        this._minspeed = 2 + Math.random();
        this._damp = 0.02;
        this._awarerange = 300;
        this._type = 'littlefish';
        this._imgsrc = 'imgs/littlefish.png';
    }
    move(player) {
        if (this._speed > this._damp)
            this._speed -= this._damp;
        else
            this._speed = 0;
        super.move();
        if (this._speed < this._minspeed) {
            this._speed = this._maxspeed;
            let distance = [player.position[0] - this._position[0], player.position[1] - this.position[1]];
            let len = Math.sqrt(distance[0] * distance[0] + distance[1] * distance[1]);
            if (len < this._awarerange && player.size > this._size) {
                this._direction = super.norm([-distance[0], -distance[1]]);
            }
            else {
                let x = Math.random() - 0.5, y = Math.random() - 0.5;
                while (x + this._direction[0] == 0 && y + this._direction[1] == 0) {
                    x = Math.random() - 0.5;
                    y = Math.random() - 0.5;
                }
                this._direction = super.norm([x + this._direction[0], y + this._direction[1]]);
            }
        }
    }
}
class shark extends basefish {
    constructor(size, position, direction) {
        super(size, position, direction, 0);
        this._maxspeed = 6.5 + Math.random();
        this._minspeed = 4 + Math.random();
        this._normalspeed = 5;
        this._maxdamp = 0.1;
        this._normaldamp = 0.02;
        this._damp = 0.02;
        this._awarerange = 300;
        this._type = 'shark';
        this._imgsrc = 'imgs/shark.png';
    }
    move(player) {
        if (this._speed > this._damp)
            this._speed -= this._damp;
        else
            this._speed = 0;
        super.move();
        if (this._speed < this._minspeed) {
            this._speed = this._normalspeed;//normal speed
            this._damp = this._normaldamp;
            let distance = [player.position[0] - this._position[0], player.position[1] - this.position[1]];
            let len = Math.sqrt(distance[0] * distance[0] + distance[1] * distance[1]);
            if (len < this._awarerange) {//hunting mod
                this._damp = this._maxdamp;
                this._speed = this._maxspeed;
                if (player.size > this._size)
                    this._direction = super.norm([-distance[0], -distance[1]]);
                else if (player.size < this.size)
                    this._direction = super.norm(distance);
            }
            else {
                let x = (Math.random() - 0.5) / 2, y = (Math.random() - 0.5) / 2;
                while (x + this._direction[0] == 0 && y + this._direction[1] == 0) {
                    x = (Math.random() - 0.5) / 2;
                    y = (Math.random() - 0.5) / 2;
                }
                this._direction = super.norm([x + this._direction[0], y + this._direction[1]]);
            }
        }
    }
}
class jellyfish extends basefish {
    constructor(size, position) {
        super(size, position, [0, -1], 0);
        this._maxspeed = 6.5 + Math.random();
        this._minspeed = -1.5 + Math.random();
        this._updamp = 0.3;
        this._downdamp = 0.01;
        this._state = 0;//0:up;1:down
        this._type = 'jellyfish';
        this._imgsrc = 'imgs/jellyfish.png';
    }
    move(player) {
        if (this._state == 0) {
            this._speed -= this._updamp;
            if (this._speed < this._minspeed) {
                this._state = 1;
            }
        }
        else {
            this._speed += this._downdamp;
            if (this._speed > 0) {
                this._speed = this._maxspeed;
                this._state = 0;
                this._direction = super.norm([Math.random() - 0.5, -1]);
            }
        }
        super.move();
    }
    get rotateangle() {
        if (this._direction[1] >= 0) {
            return [0, 0];
        }
        let angle = Math.atan(this._direction[0] / this._direction[1]) / Math.PI * 180;
        return [0, -angle];
    }
}

let timer;
const MinDistance = 30;

class mousetarget {
    constructor(target = [0, 0], speed = 0) {
        this._target = target;
        this._speed = speed;
    }
    get speed() { return this._speed }
    set speed(speed) {
        if (speed < 0) {
            throw ("err:negative speed");
        }
        else {
            this._speed = speed;
        }
    }
    get target() { return this._target }
    set target(target) { this._target = target }
}

//init player
let player = new myfish(50, [0, 0], [1, 0], 0, 100, 0.5, 8);
player.element = document.createElement("div");
body.append(player.element);
let fishs = [];


let mouse = new mousetarget();//鼠标控制移动

function init() {
    let bg = initbg();
    let fishnum = maxfishnum;
    initfishs(fishnum);
    timer = setInterval(() => { render(bg) }, framerate);
}
function initbg() {
    let playground = document.createElement("div");
    let bg = { top: 10, left: 10, width: 1000, height: 700, element: playground };
    playground.style.left = bg.left + 'px';
    playground.style.top = bg.top + 'px';
    playground.style.width = bg.width + 'px';
    playground.style.height = bg.height + 'px';
    body.appendChild(playground);
    playground.addEventListener("mousemove", function (e) {
        let target = [e.pageX - bg.left - bg.width / 2, e.pageY - bg.top - bg.height / 2];
        let distance = [target[0], target[1]];
        let len = Math.sqrt(distance[0] * distance[0] + distance[1] * distance[1]);
        if (len < MinDistance)
            settarget(null);//come to stop
        else {
            let speed = len / 100;//a magic number,not good
            settarget(target, speed);
        }

    })//设置鼠标控制方式

    return bg;
}

function initfishs(num) {
    for (let i = 0; i < num / 6; i++) {
        fishs.push(new jellyfish(Math.random() * 100 + 30, [Math.random() * 10000 - 5000, Math.random() * 10000]));

    }
    for (let i = 0; i < num * 3 / 4; i++) {
        fishs.push(new littlefish(Math.random() * 20 + 30, [Math.random() * 10000 - 5000, Math.random() * 10000], [1, 0]));

    }
    for (let i = 0; i < num / 12; i++) {
        let depth = Math.random() * 10000;
        fishs.push(new shark(20 + Math.random() * 50 + depth / 10, [Math.random() * 10000 - 5000, depth], [1, 0]));

    }
    for (let fish of fishs) { fish.element = document.createElement("div"); body.appendChild(fish.element); }
}

function render(bg) {
    body.removeChild(player.element);
    renderbg(bg);

    redraw(player, bg);
    for (let fish of fishs) { setTimeout(() => { if (fish.element != null) { body.removeChild(fish.element); fish.element = null; }; if (inview(playercoord(fish.position), bg)) { redraw(fish, bg) } }, 0); }

    player.move(mouse.target, mouse.speed);
    for (let fish of fishs) { setTimeout(() => { fish.move(player) }, 0) };
}
function renderbg(bg) {
    let initbgcolor = {
        r: 0x20, g: 0xBF, b: 0xFF,
        divide(num) { this.r /= num; this.g /= num; this.b /= num },
        getrgb() {
            let rgb;
            let s_r = parseInt(this.r).toString(16);
            let s_g = parseInt(this.g).toString(16);
            let s_b = parseInt(this.b).toString(16);
            while (s_r.length < 2)
                s_r = '0' + s_r;
            while (s_g.length < 2)
                s_g = '0' + s_g;
            while (s_b.length < 2)
                s_b = '0' + s_b;
            return s_r + s_g + s_b;
        }
    }
    initbgcolor.divide(Math.max(1, player.position[1] / 1000 + 1));
    console.log(initbgcolor.getrgb());
    bg.element.style.background = '#' + initbgcolor.getrgb();
}
function redraw(fish, bg) {

    let obj = document.createElement("div");
    let pos = playercoord(fish.position);
    pos[0] += bg.left + bg.width / 2;
    pos[1] += bg.top + bg.height / 2;
    //使player位于background的中心位置
    obj.style.left = pos[0] + 'px';
    obj.style.top = pos[1] + 'px';
    obj.className = "fish";
    let img = document.createElement("img");
    img.className = fish.type;
    img.setAttribute("src", fish.imgsrc);
    rotate_hor(img, fish.rotateangle);
    obj.appendChild(img);
    obj.style.width = fish.size + 'px';
    obj.style.height = fish.size + 'px';
    body.appendChild(obj);
    fish.element = obj;
}
function rotate_hor(img, angle) {
    img.style.transform = 'rotateY(' + angle[0] + 'deg) rotateZ(' + angle[1] + 'deg)';
}
function playercoord(position) {
    return [position[0] - player.position[0], position[1] - player.position[1]];
}

function settarget(target, speed) {
    mouse.target = target;
    mouse.speed = speed;
}

function inview(position, bg) {
    position[0] += bg.left + bg.width / 2;
    position[1] += bg.top + bg.height / 2;
    //使player位于background的中心位置
    if (position[0] > bg.left && position[0] < bg.left + bg.width && position[1] > bg.top && position[1] < bg.top + bg.height) {
        console.log("inview");
        return true;
    }

    return false;
}

function removeClass(className) {
    var ele = document.getElementsByClassName(className);
    for (let el of ele) { el.remove(); }
}
init();