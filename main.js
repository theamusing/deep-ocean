"use strict"

const body = document.querySelector("body");
const framerate = 50;
const maxfishnum = 72;

class basefish {
    constructor(size = 1, position = [0, 0], direction = [1, 0], speed = 0) {
        this._size = size;
        this._position = position;
        this._direction = direction;
        this._speed = speed;
        this._element = null;
        this._type = 'basefish';
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
    get maxsize() {
        return Infinity;
    }
    get type() { return this._type }
    get imgsrc() { return 'imgs/' + this._type + '.png' }
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
    reset(size, position) { //重设 与被吃重生不同
        this._size = size;
        this._position = position;
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
        this._awarerange = 200;
        this._type = 'littlefish';
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
            if (len < this._awarerange + this._size / 2 + player.size / 2 && player.size > this._size) {
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
    constructor(size, position, direction, maxspeed = 6.5, minspeed = 4, normalspeed = 5, maxdamp = 0.1, normaldamp = 0.01, awarerange = 200) {
        super(size, position, direction, 0);
        this._maxspeed = maxspeed;
        this._minspeed = minspeed;
        this._normalspeed = normalspeed;
        this._maxdamp = maxdamp;
        this._normaldamp = normaldamp;
        this._damp = this._normaldamp;
        this._awarerange = awarerange;
        this._type = 'shark';
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
            if (len < this._awarerange + this._size / 2 + player.size / 2) {//hunting mod
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
class makoshark extends shark {
    constructor(size, position, direction, maxspeed = 6, minspeed = 3.5, normalspeed = 4.5, maxdamp = 0.1, normaldamp = 0.01, awarerange = 150) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'makoshark';
        this._maxsize = 150;
        this._size = Math.min(this._size, this._maxsize);
    }
    get maxsize() {
        return this._maxsize;
    }
}

class greatwhiteshark extends shark {
    constructor(size, position, direction, maxspeed = 7.5, minspeed = 4.5, normalspeed = 6, maxdamp = 0.1, normaldamp = 0.01, awarerange = 300) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'greatwhiteshark';
    }
}

class hammerheadshark extends shark {
    constructor(size, position, direction, maxspeed = 7, minspeed = 4, normalspeed = 5.5, maxdamp = 0.15, normaldamp = 0.01, awarerange = 200) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'hammerheadshark';
        this._maxsize = 300;
        this._size = Math.min(this._size, this._maxsize);
    }
    get maxsize() {
        return this._maxsize;
    }
}

class lanternfish extends shark {
    constructor(size, position, direction, maxspeed = 10, minspeed = 2, normalspeed = 4.5, maxdamp = 0.2, normaldamp = 0.01, awarerange = 150) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'lanternfish';
    }
}
class rasborafish extends littlefish {
    constructor(size, position, direction) {
        super(size, position, direction);
        this._type = 'rasborafish';
    }
}// 三角灯鱼

class pomfretfish extends littlefish {
    constructor(size, position, direction) {
        super(size, position, direction);
        this._type = 'pomfretfish';
    }
}// 鲳鱼

class zebrafish extends littlefish {
    constructor(size, position, direction) {
        super(size, position, direction);
        this._type = 'zebrafish';
    }
}// 斑马鱼

class swordfish extends littlefish {
    constructor(size, position, direction) {
        super(size, position, direction);
        this._type = 'swordfish';
        this._maxspeed = 8 + Math.random();
        this._minspeed = 5 + Math.random();
        this._damp = 0.5;
    }

    move(player) {
        super.move(player);
        this._direction[1] = 0;
        this._direction = super.norm(this._direction);
    }
}// 剑鱼

class pufferfish extends littlefish {
    constructor(size, position, direction, maxsize = 2 * size) {
        super(size, position, direction);
        this._type = 'pufferfish';
        this._maxspeed = 5 + Math.random();
        this._minspeed = 3 + Math.random();
        this._damp = 0.2;
        this._minsize = size;
        this._maxsize = Math.max(maxsize, size);
        this._awarerange = 100;
    }

    move(player) {
        super.move(player);
        let distance = [player.position[0] - this._position[0], player.position[1] - this.position[1]];
        let len = Math.sqrt(distance[0] * distance[0] + distance[1] * distance[1]);
        if (len < this._awarerange + this._minsize / 2 + player.size / 2 && player.size > this._minsize)
            this._size = this._maxsize;
        else
            this._size = this._minsize;
    }
}// 河豚

class pinkjellyfish extends jellyfish {
    constructor(size, position) {
        super(size, position);
        this._type = 'pinkjellyfish';
    }
}

class bluejellyfish extends jellyfish {
    constructor(size, position) {
        super(size, position);
        this._type = 'bluejellyfish';
    }
}

class giantjellyfish extends jellyfish {
    constructor(size, position) {
        super(size, position);
        this._maxspeed = 12 + Math.random();
        this._minspeed = -3 + Math.random();
        this._updamp = 0.5;
        this._downdamp = 0.05;
        this._type = 'giantjellyfish';
    }
}

class rollingbgimg {
    constructor(src, src_sky, src_seabed, width, height, range = [0, 10000]) {
        this._src = src;
        this._src_sky = src_sky;
        this._src_seabed = src_seabed;
        this._width = width;
        this._height = height;
        let img = { position: [0, height / 2], element: null, up: null, down: null, left: null, right: null };
        this._imgs = [img];
        this._range = range;
    }
    unbind(img) {
        if (img.up != null) {
            img.up.down = null;
        }
        if (img.down != null) {
            img.down.up = null;
        }
        if (img.left != null) {
            img.left.right = null;
        }
        if (img.right != null) {
            img.right.left = null;
        }
    }
    render(bg) {
        let imgs = []
        for (let img of this._imgs) {
            if (img.element != null) {
                //bg.element.removeChild(img.element);
                img.element.remove();
            }
            let pos = playercoord(img.position);
            // pos[0] += bg.left + bg.width / 2;
            // pos[1] += bg.top + bg.height / 2;
            if (!(pos[0] + this._width / 2 < -bg.width / 2 || pos[0] - this._width / 2 > bg.width / 2 || pos[1] + this._height / 2 < -bg.height / 2 || pos[1] - this._height / 2 > bg.height / 2)) {
                imgs.push(img);
            }
            else {
                this.unbind(img);
            }
        }
        this._imgs = imgs;
        for (let img of this._imgs) {
            this.redraw(img, bg);
            let pos = playercoord(img.position);
            // pos[0] += bg.left + bg.width / 2;
            // pos[1] += bg.top + bg.height / 2;
            if (pos[0] + this._width / 2 < bg.width / 2 && img.right == null) {
                let newimg = { position: [img.position[0] + this._width, img.position[1]], element: null, up: null, down: null, left: null, right: null };
                newimg.left = img;
                img.right = newimg;
                if (img.up != null && img.up.right != null) {
                    newimg.up = img.up.right;
                    img.up.right.down = newimg;
                }
                if (img.down != null && img.down.right != null) {
                    newimg.down = img.down.right;
                    img.down.right.up = newimg;
                }
                imgs.push(newimg);
                this.redraw(newimg, bg);
            }
            if (pos[0] - this._width / 2 > -bg.width / 2 && img.left == null) {
                let newimg = { position: [img.position[0] - this._width, img.position[1]], element: null, up: null, down: null, left: null, right: null };
                newimg.right = img;
                img.left = newimg;
                if (img.up != null && img.up.left != null) {
                    newimg.up = img.up.left;
                    img.up.left.down = newimg;
                }
                if (img.down != null && img.down.left != null) {
                    newimg.down = img.down.left;
                    img.down.left.up = newimg;
                }
                imgs.push(newimg);
                this.redraw(newimg, bg);
            }
            if (pos[1] + this._height / 2 < bg.height / 2 && img.down == null) {
                let newimg = { position: [img.position[0], img.position[1] + this._height], element: null, up: null, down: null, left: null, right: null };
                newimg.up = img;
                img.down = newimg;
                if (img.left != null && img.left.down != null) {
                    newimg.left = img.left.down;
                    img.left.down.right = newimg;
                }
                if (img.right != null && img.right.down != null) {
                    newimg.right = img.right.down;
                    img.right.down.left = newimg;
                }
                imgs.push(newimg);
                this.redraw(newimg, bg);
            }
            if (pos[1] - this._height / 2 > -bg.height / 2 && img.up == null) {
                let newimg = { position: [img.position[0], img.position[1] - this._height], element: null, up: null, down: null, left: null, right: null };
                newimg.down = img;
                img.up = newimg;
                if (img.left != null && img.left.up != null) {
                    newimg.left = img.left.up;
                    img.left.up.right = newimg;
                }
                if (img.right != null && img.right.up != null) {
                    newimg.right = img.right.up;
                    img.right.up.left = newimg;
                }
                imgs.push(newimg);
                this.redraw(newimg, bg);
            }
        }
        this._imgs = imgs;
    }
    redraw(img, bg) {
        if (img.element != null) {
            // bg.element.removeChild(img.element);
            img.element.remove();
        }
        img.element = document.createElement('img');
        img.element.style.position = 'fixed';
        img.element.style.width = this._width + 'px';
        img.element.style.height = this._height + 'px';

        if (img.position[1] < this._range[0])
            img.element.src = this._src_sky;
        else if (img.position[1] > this._range[1])
            img.element.src = this._src_seabed;
        else
            img.element.src = this._src;
        let pos = playercoord(img.position);
        pos[0] += bg.left + bg.width / 2 - this._width / 2;
        pos[1] += bg.top + bg.height / 2 - this._height / 2;
        img.element.style.top = pos[1] + 'px';
        img.element.style.left = pos[0] + 'px';
        bg.element.insertBefore(img.element, bg.element.children[0]);
        //bg.element.appendChild(img.element);
    }
}
let timer;
const MinDistance = 30;
const bgimg_path = 'imgs/bgimg.png';
const sky_path = 'imgs/sky.png';
const seabed_path = 'imgs/seabed.png';

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
let fishs = [];


let mouse = new mousetarget();//鼠标控制移动

function init() {
    let bg = initbg();
    let fishnum = maxfishnum;
    initfishs(fishnum, bg);
    timer = setInterval(() => { render(bg) }, framerate);
}
function initbg() {
    let playground = document.createElement("div");
    let bg = { top: 0, left: 0, width: document.body.offsetWidth, height: window.innerHeight, element: playground, rollingimg: null };
    playground.style.left = bg.left + 'px';
    playground.style.top = bg.top + 'px';
    playground.style.width = '100%';
    playground.style.height = '100%';
    let bgimg = new rollingbgimg(bgimg_path, sky_path, seabed_path, 5000, 5000);
    bg.rollingimg = bgimg;
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

function initfishs(num, bg) {
    for (let i = 0; i < num; i++) {
        fishs.push(genAFish([200, 200], bg));
    }
    for (let fish of fishs) { fish.element = null; }
}

function render(bg) {
    renderbg(bg);
    bg.rollingimg.render(bg);
    if (player.element != null)
        bg.element.removeChild(player.element);
    redraw(player, bg);
    for (let fish of fishs) { //生成在html中
        setTimeout(() => {
            if (fish.element != null) {
                bg.element.removeChild(fish.element); fish.element = null;
            };
            if (inview(fish, bg)) {
                redraw(fish, bg)
            }
        }, 0);
    }
    player.move(mouse.target, mouse.speed);
    for (let i = 0; i < maxfishnum; i++) { //更新鱼的状态
        let fish = fishs[i];
        setTimeout(() => {
            fish.move(player);
            let tmp = playercoord(fish.position);
            if (Math.abs(tmp[0]) > bg.width * 1.5 || Math.abs(tmp[1]) > bg.height * 1.5) { //太远重新生成
                fishs[i] = genAFish([bg.width, bg.height], bg);
                console.log("respawn:" + fishs[i].type + "," + fishs[i].position);
            }
            else if (Math.abs(tmp[0]) < player.size / 2.5 && Math.abs(tmp[1]) < player.size / 2.5) { //距离近判断吃
                if (player.size > fish.size) {
                    bg.element.removeChild(fish.element);
                    player.size += fish.size / 50; // TODO:差距过大时减少收益
                    fishs[i] = genAFish([bg.width, bg.height], bg);
                }
            }
        }, 0)
    };
}

function genAFish(innersize, bg, rnd = undefined) { //生成一条鱼 rnd用来手动控制概率
    if (rnd === undefined) { rnd = Math.random() * 1200; }
    if (rnd < 200) {
        let type = Math.random() * 3;
        if (type < 1.5)
            return new pinkjellyfish(Math.random() * 50 + 30, genRandPos(player.position, innersize, [bg.width * 2, bg.height * 2]));
        else if (type < 2.5)
            return new bluejellyfish(Math.random() * 50 + 30, genRandPos(player.position, innersize, [bg.width * 2, bg.height * 2]));
        else
            return new giantjellyfish(Math.random() * 100 + 30, genRandPos(player.position, innersize, [bg.width * 2, bg.height * 2]));
    }
    else if (rnd < 1100) {
        return new pufferfish(Math.random() * 50 + 30, genRandPos(player.position, innersize, [bg.width * 2, bg.height * 2]), [1, 0]);
    }
    else {
        rnd -= 1100;
        let pos = genRandPos(player.position, innersize, [bg.width * 2, bg.height * 2]);
        if (pos[1] < 5000) {
            if (rnd < 50) {
                return new makoshark(20 + Math.random() * 50 + pos[1] / 10, pos, [1, 0]);
            }
            else return new hammerheadshark(50 + Math.random() * 50 + pos[1] / 50, pos, [1, 0]);
        }
        else if (pos[1] < 8000) {
            if (rnd < 40) {
                return new makoshark(20 + Math.random() * 50 + pos[1] / 10, pos, [1, 0]);
            }
            else if (rnd < 80) {
                return new hammerheadshark(50 + Math.random() * 50 + pos[1] / 50, pos, [1, 0]);
            }
            else return new lanternfish(50 + Math.random() * 50 + pos[1] / 10, pos, [1, 0]);
        }
        else {
            if (rnd < 66) {
                return new makoshark(20 + Math.random() * 50 + pos[1] / 10, pos, [1, 0]);
            }
            else return new greatwhiteshark(50 + Math.random() * 50 + pos[1] / 10, pos, [1, 0]);
        }
    }
}
function genRandPos(position, innersize, outtersize) { //生成随机坐标 innersize是不会出现的区域
    let x, y, tmp;
    tmp = Math.random() * (outtersize[0] - innersize[0]) - (outtersize[0] - innersize[0]) / 2;
    if (tmp < 0)
        x = position[0] - innersize[0] / 2 + tmp;
    else x = position[0] + innersize[0] / 2 + tmp;
    tmp = Math.random() * (outtersize[1] - innersize[1]) - (outtersize[1] - innersize[1]) / 2;
    if (tmp < 0)
        y = position[1] - innersize[1] / 2 + tmp;
    else y = position[1] + innersize[1] / 2 + tmp;
    return [x, y];
}
function renderbg(bg) {
    bg.width = document.body.offsetWidth;
    bg.height = window.innerHeight;
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
    //console.log(initbgcolor.getrgb());
    bg.element.style.background = '#' + initbgcolor.getrgb();
}
function redraw(fish, bg) {

    let obj = document.createElement("div");
    let pos = playercoord(fish.position);
    pos[0] += bg.left + bg.width / 2 - fish.size / 2;
    pos[1] += bg.top + bg.height / 2 - fish.size / 2;
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
    bg.element.appendChild(obj);
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

function inview(fish, bg) {
    let position = playercoord(fish.position);
    position[0] += bg.left + bg.width / 2;
    position[1] += bg.top + bg.height / 2;
    //使player位于background的中心位置
    if (position[0] + fish.size / 2 > bg.left && position[0] - fish.size / 2 < bg.left + bg.width && position[1] + fish.size / 2 > bg.top && position[1] - fish.size / 2 < bg.top + bg.height) {
        //console.log("inview");
        return true;
    }

    return false;
}

function removeClass(className) {
    var ele = document.getElementsByClassName(className);
    for (let el of ele) { el.remove(); }
}
init();
