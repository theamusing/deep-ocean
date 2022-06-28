"use strict"

const body = document.querySelector("body");
const framerate = 50;
const maxfishnum = 72;
const maxscreensize = 500;
const range = [0, 10000];

class basefish {
    constructor(size = 1, position = [0, 0], direction = [1, 0], speed = 0) {
        this._size = size;
        this._position = position;
        this._direction = direction;
        this._speed = speed;
        this._element = null;
        this._type = 'basefish';
        this._score = 1;
        this._heal = size / 10;
        this._lockhealth = false;
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
    get heal() { return this._heal }
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
    get score() { return this._score; }
    get lockhealth() { return this._lockhealth; }
    set lockhealth(f) { this._lockhealth = f; }
    move() {
        this._position = [this._position[0] + this._direction[0] * this.speed, this._position[1] + this._direction[1] * this.speed];
        if (this._position[1] < range[0])
            this._position[1] = range[0];
        if (this._position[1] > range[1])
            this._position[1] = range[1];
    }
    getclose(player) {
        return;
    }
    eat(fish) {
        return;
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
        this._statusbar = null;
        this._dashable = true;
    }
    get health() { return this._health }
    get dashable() { return this._dashable }
    set dashable(d) { this._dashable = d }
    set health(health) { this._health = health }
    get maxspeed() { return this._maxspeed }
    set maxspeed(maxspeed) { this._maxspeed = maxspeed }
    get damp() { return this._damp }
    get statusbar() { return this._statusbar; }
    set damp(damp) {
        if (damp < 0) {
            throw ("err:negative damp");
        }
        else {
            this._damp = damp;
        }
    }
    dash() {
        if (this.dashable) {
            let cd = 2000;
            let maxspeed = this.maxspeed;
            let dashspeed = this.maxspeed * 3;
            this.maxspeed = dashspeed;
            this.speed = this.maxspeed;
            this.dashable = false;
            let timer = setInterval(() => {
                this.maxspeed = Math.max(maxspeed, this.maxspeed - (dashspeed - maxspeed) / 10);
            }, 50);
            setTimeout(() => {
                this.dashable = true;
                this.maxspeed = maxspeed;
                clearInterval(timer);
            }, cd);
        }
    }
    eat(fish) {
        // base:increase size
        let diff = fish.size / this._size;
        this._size += Math.min(fish.size * diff * diff / 10, 10);
        this._score += fish.score;
        this._health = Math.min(100, this._health + fish.heal);
    }
    hurted() {
        this._type = "myfish_hurted";
        setTimeout(() => {
            this._type = "myfish";
        }, 200);
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
    drawstatus(bg) {
        let bar = document.createElement("table");
        let tr1 = document.createElement("tr");
        let th1 = document.createElement("th");
        let td1 = document.createElement("td");
        th1.textContent = "当前位置";
        td1.textContent = this._position[0].toFixed(0) + "," + this._position[1].toFixed(0);
        tr1.appendChild(th1);
        tr1.appendChild(td1);
        bar.appendChild(tr1);
        let tr2 = document.createElement("tr");
        let th2 = document.createElement("th");
        let td2 = document.createElement("td");
        th2.textContent = "当前大小";
        td2.textContent = this._size.toFixed(0);
        tr2.appendChild(th2);
        tr2.appendChild(td2);
        bar.appendChild(tr2);
        let tr3 = document.createElement("tr");
        let th3 = document.createElement("th");
        let td3 = document.createElement("td");
        th3.textContent = "分数";
        td3.textContent = this._score.toFixed(0);
        tr3.appendChild(th3);
        tr3.appendChild(td3);
        bar.appendChild(tr3);
        let tr4 = document.createElement("tr");
        let th4 = document.createElement("th");
        let td4 = document.createElement("td");
        th4.textContent = "血量";
        td4.textContent = this._health.toFixed(0);
        tr4.appendChild(th4);
        tr4.appendChild(td4);
        bar.appendChild(tr4);
        this._statusbar = bar;
        bar.style.color = "#FFFFFF"
        bg.element.appendChild(bar);
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
        this._score = 2;
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
            if (len < this._awarerange + this._size / 2 + player.size / 2 && player.size > this._size * 1.2) {
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
        this._status = 0;//normal
        this._type = 'shark';
        this._score = 100;
    }
    getclose(player) {
        if (!player.lockhealth && this._status == 1) {
            player.health -= this.size / 10;
            player.lockhealth = true;
            let deltatime = 500;//ms
            setTimeout(() => {
                player.lockhealth = false;
            }, deltatime);
            player.hurted();
        }
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
                if (player.size > this._size * 1.2) {
                    this._direction = super.norm([-distance[0], -distance[1]]);
                    this._status = 0;
                }
                else if (player.size * 1.1 < this.size) {
                    this._direction = super.norm(distance);
                    this._status = 1;
                }
            }
            else {
                this._status = 0;
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
        this._score = 20;
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
    getclose(player) {
        if (!player.lockhealth) {
            player.health -= this.size / 100;
            player.lockhealth = true;
            let deltatime = 100;//ms
            let temptimer = setTimeout(() => {
                player.lockhealth = false;
            }, deltatime);
            player.hurted();
        }
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
    constructor(size, position, direction, maxspeed = 9, minspeed = 3.5, normalspeed = 4.5, maxdamp = 0.2, normaldamp = 0.01, awarerange = 150) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'makoshark';
        this._maxsize = 200;
        this._size = Math.min(this._size, this._maxsize);
        this._score = 200;
    }
    get maxsize() {
        return this._maxsize;
    }
}
class ghostshark extends shark {
    constructor(size, position, direction, maxspeed = 9, minspeed = 3.5, normalspeed = 4.5, maxdamp = 0.2, normaldamp = 0.01, awarerange = 150) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'ghostshark';
        this._score = 200;
    }
    get maxsize() {
        return this._maxsize;
    }
}
class greatwhiteshark extends shark {
    constructor(size, position, direction, maxspeed = 7.5, minspeed = 4.5, normalspeed = 6, maxdamp = 0.1, normaldamp = 0.01, awarerange = 300) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'greatwhiteshark';
        this._score = 50000;
    }
}

class hammerheadshark extends shark {
    constructor(size, position, direction, maxspeed = 8, minspeed = 4, normalspeed = 5.5, maxdamp = 0.2, normaldamp = 0.01, awarerange = 200) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'hammerheadshark';
        this._maxsize = 350;
        this._size = Math.min(this._size, this._maxsize);
        this._score = 200;
    }
    get maxsize() {
        return this._maxsize;
    }
}

class lanternfish extends shark {
    constructor(size, position, direction, maxspeed = 10, minspeed = 2, normalspeed = 4.5, maxdamp = 0.2, normaldamp = 0.01, awarerange = 150) {
        super(size, position, direction, maxspeed, minspeed, normalspeed, maxdamp, normaldamp, awarerange);
        this._type = 'lanternfish';
        this._score = 20000;
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
        this._score = 300;
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
        this._score = 30;
    }
    getclose(player) {
        if (!player.lockhealth && this.size == this._maxsize) {
            player.health -= this.size / 50;
            player.lockhealth = true;
            let deltatime = 500;//ms
            let temptimer = setTimeout(() => {
                player.lockhealth = false;
            }, deltatime);
            player.hurted();
        }
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

class moonfish extends littlefish {
    constructor(size, position, direction) {
        super(size, position, direction);
        this._type = 'moonfish';
        this._maxspeed = 6 + Math.random();
        this._minspeed = 3 + Math.random();
        this._damp = 0.2;
        this._score = 50;
    }

    move(player) {
        super.move(player);
        this._direction[1] = 0;
        this._direction = super.norm(this._direction);
    }
}// 翻车鱼
class ruberfish extends littlefish {
    constructor(size, position, direction) {
        super(size, position, direction);
        this._type = 'ruberfish';
        this._maxspeed = 9 + Math.random();
        this._minspeed = 6 + Math.random();
        this._damp = 0.5;
        this._score = 5000;
    }

}// 宝石鱼
class pinkjellyfish extends jellyfish {
    constructor(size, position) {
        super(size, position);
        this._type = 'pinkjellyfish';
        this._score = 35;
    }
}

class bluejellyfish extends jellyfish {
    constructor(size, position) {
        super(size, position);
        this._type = 'bluejellyfish';
        this._score = 50;
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
        this._score = 100;
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
let player = new myfish(50, [0, 500], [1, 0], 0, 100, 0.5, 7);
let fishs = [];
let limitnum = [0, 0]; //giantjellyfish/greatwhiteshark

let mouse = new mousetarget();//鼠标控制移动

function init() {
    let bg = initbg();
    let fishnum = maxfishnum;
    initfishs(fishnum, bg);
    timer = setInterval(() => { render(bg) }, framerate);
    setInterval(() => {
        player.health -= 0.02 * (1 + player.size / 100); if (player.health <= 0) { gameover(); }
    }, framerate);
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

    });//设置鼠标控制方式
    playground.addEventListener("mousedown", function () {
        player.dash();
    });

    return bg;
}

function initfishs(num, bg) {
    for (let i = 0; i < num; i++) {
        fishs.push(genAFish([200, 200], bg));
        // console.log("init " + fishs[i].type + ",size: " + fishs[i].size);
    }
    for (let fish of fishs) { fish.element = null; }
}

function render(bg) {
    renderbg(bg);
    bg.rollingimg.render(bg);
    if (player.element != null)
        bg.element.removeChild(player.element);
    if (player.statusbar != null)
        bg.element.removeChild(player.statusbar);
    player.drawstatus(bg);
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
            let distance = Math.sqrt(tmp[0] * tmp[0] + tmp[1] * tmp[1]);
            let alpha = (player.direction[0] * tmp[0] + player.direction[1] * tmp[1]) / distance;
            let beta = (fish.direction[0] * tmp[0] + fish.direction[1] * tmp[1]) / distance;
            let minangle = Math.min(Math.abs(alpha), Math.abs(beta));
            let detectdis = (player.size * 0.45 + fish.size * 0.4) * (2 / 3 + 1 / 3 * minangle); //侧面时判断距离小
            if (distance > bg.width * 1.5) { //太远重新生成
                if (fishs[i].type === "giantjellyfish")
                    limitnum[0]--;
                else if (fishs[i].type === "greatwhiteshark")
                    limitnum[1]--;
                fishs[i] = genAFish([bg.width, bg.height], bg);
            }
            else if (distance < detectdis) { //距离近判断吃
                if (alpha > 0.7071 && player.size > fish.size * 1.2) {
                    bg.element.removeChild(fish.element);
                    player.eat(fish);
                    if (fish.type === "giantjellyfish")
                        limitnum[0]--;
                    else if (fish.type === "greatwhiteshark")
                        limitnum[1]--;
                    fishs[i] = genAFish([bg.width, bg.height], bg);
                }//吃
                else if (player.size * 1.1 < fish.size) {
                    fish.getclose(player);
                }//被吃
            }
        }, 0)
    };
}

function genAFish(innersize, bg, rnd = undefined) { //生成一条鱼 rnd用来手动控制概率
    let pos = genRandPos(player.position, innersize, [bg.width * 2, bg.height * 2]);
    if (rnd === undefined) { rnd = Math.random() * 10000; }
    if (pos[1] < 3000) {
        if (rnd < 2400) { //24%
            return new pomfretfish(20 + Math.random() * 20, pos, [1, 0]);
        }
        else if (rnd < 4800) { //48%
            return new rasborafish(40 + Math.random() * 40, pos, [1, 0]);
        }
        else if (rnd < 7200) { //72%
            return new zebrafish(50 + Math.random() * 50, pos, [1, 0]);
        }
        else if (rnd < 7900) { //7% 
            return new pufferfish(30 + Math.random() * 30, pos, [1, 0]);
        }
        else if (rnd < 8600) { //7%
            return new pinkjellyfish(30 + Math.random() * 70, pos, [1, 0]);
        }
        else if (rnd < 9975) { //13.75%
            return new makoshark(80 + Math.random() * 70, pos, [1, 0]);
        }
        else { //0.25%
            return new ruberfish(15 + player.size / 10, pos, [1, 0]);
        }
    }
    else if (pos[1] < 6000) {
        if (rnd < 1600) { //16%
            return new pomfretfish(30 + Math.random() * 10, pos, [1, 0]);
        }
        else if (rnd < 3200) { //16%
            return new rasborafish(50 + Math.random() * 30, pos, [1, 0]);
        }
        else if (rnd < 4800) { //16%
            return new zebrafish(65 + Math.random() * 35, pos, [1, 0]);
        }
        else if (rnd < 5800) { //10%
            return new swordfish(75 + Math.random() * 75, pos, [1, 0]);
        }
        else if (rnd < 7000) { //12%
            return new makoshark(120 + Math.random() * 80, pos, [1, 0]);
        }
        else if (rnd < 7800) { //8%
            return new hammerheadshark(240 + Math.random() * 60, pos, [1, 0]);
        }
        else if (rnd < 9200) { //14%
            return new pinkjellyfish(40 + Math.random() * 80, pos, [1, 0]);
        }
        else if (rnd < 9950) { //7.5%
            return new pufferfish(90 + Math.random() * 35, pos, [1, 0]);
        }
        else { //0.5%
            return new ruberfish(15 + player.size / 10, pos, [1, 0]);
        }
    }
    else if (pos[1] < 8000) {
        if (rnd < 500) { //5%
            return new pomfretfish(30 + Math.random() * 15, pos, [1, 0]);
        }
        else if (rnd < 1000) { //5%
            return new rasborafish(60 + Math.random() * 30, pos, [1, 0]);
        }
        else if (rnd < 1500) { //5%
            return new zebrafish(75 + Math.random() * 35, pos, [1, 0]);
        }
        else if (rnd < 2000) { //5%
            return new pufferfish(90 + Math.random() * 35, pos, [1, 0]);
        }
        else if (rnd < 2600) { //6%
            return new makoshark(150 + Math.random() * 50, pos, [1, 0]);
        }
        else if (rnd < 3800) { //12%
            return new hammerheadshark(250 + Math.random() * 100, pos, [1, 0]);
        }
        else if (rnd < 4800) { //10%
            return new ghostshark(350 + Math.random() * 100, pos, [1, 0]);
        }
        else if (rnd < 6200) { //14%
            return new bluejellyfish(80 + Math.random() * 80, pos, [1, 0]);
        }
        else if (rnd < 6700) { //5%
            return new pinkjellyfish(40 + Math.random() * 40, pos, [1, 0]);
        }
        else if (rnd < 7000) { //3%
            return new giantjellyfish(240 + Math.random() * 120, pos, [1, 0]);
        }
        else if (rnd < 7500) { //5%
            return new lanternfish(450 + Math.random() * 100, pos, [1, 0]);
        }
        else if (rnd < 8700) { //12%
            return new moonfish(150 + Math.random() * 100, pos, [1, 0]);
        }
        else if (rnd < 9925) { //12.25%
            return new swordfish(100 + Math.random() * 50, pos, [1, 0]);
        }
        else { //0.75%
            return new ruberfish(15 + player.size / 10, pos, [1, 0]);
        }
    }
    else {
        if (rnd < 500) { //5%
            return new pomfretfish(30 + Math.random() * 15, pos, [1, 0]);
        }
        else if (rnd < 1000) { //5%
            return new rasborafish(60 + Math.random() * 30, pos, [1, 0]);
        }
        else if (rnd < 1500) { //5%
            return new zebrafish(75 + Math.random() * 35, pos, [1, 0]);
        }
        else if (rnd < 3000) { //15%
            return new swordfish(100 + Math.random() * 50, pos, [1, 0]);
        }
        else if (rnd < 3500) { //5%
            return new pufferfish(100 + Math.random() * 40, pos, [1, 0]);
        }
        else if (rnd < 4000) { //5%
            return new pinkjellyfish(50 + Math.random() * 50, pos, [1, 0]);
        }
        else if (rnd < 5500) { //15%
            return new bluejellyfish(100 + Math.random() * 100, pos, [1, 0]);
        }
        else if (rnd < 6500) { //10%
            return new ghostshark(400 + Math.random() * 150, pos, [1, 0]);
        }
        else if (rnd < 6900) { //4% max2
            if (limitnum[0] < 2) {
                limitnum[0]++;
                return new giantjellyfish(600 + Math.random() * 100, pos, [1, 0]);
            } else return new bluejellyfish(100 + Math.random() * 100, pos, [1, 0]);
        }
        else if (rnd < 7100) { //2% max1
            if (limitnum[1] < 1) {
                limitnum[1]++;
                return new greatwhiteshark(500 + player.size / 2, pos, [1, 0]);
            } else return new ghostshark(400 + Math.random() * 150, pos, [1, 0]);
        }
        else if (rnd < 8400) { //13%
            return new lanternfish(550 + Math.random() * 100, pos, [1, 0]);
        }
        else if (rnd < 9900) { //15%
            return new moonfish(250 + Math.random() * 50, pos, [1, 0]);
        }
        else { //1%
            return new ruberfish(15 + player.size / 10, pos, [1, 0]);
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
    while (y < range[0] || y > range[1]) {
        tmp = Math.random() * (outtersize[1] - innersize[1]) - (outtersize[1] - innersize[1]) / 2;
        if (tmp < 0)
            y = position[1] - innersize[1] / 2 + tmp;
        else y = position[1] + innersize[1] / 2 + tmp;
    }
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
    pos = [screenadapt(pos[0]), screenadapt(pos[1])];
    let size = screenadapt(fish.size);
    pos[0] += bg.left + bg.width / 2 - size / 2;
    pos[1] += bg.top + bg.height / 2 - size / 2;
    //使player位于background的中心位置
    obj.style.left = pos[0] + 'px';
    obj.style.top = pos[1] + 'px';
    obj.className = "fish";
    let img = document.createElement("img");
    img.className = fish.type;
    img.setAttribute("src", fish.imgsrc);
    rotate_hor(img, fish.rotateangle);
    obj.appendChild(img);
    obj.style.width = size + 'px';
    obj.style.height = size + 'px';
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
    position = [screenadapt(position[0]), screenadapt(position[1])];
    position[0] += bg.left + bg.width / 2;
    position[1] += bg.top + bg.height / 2;
    let size = screenadapt(fish.size);
    //使player位于background的中心位置
    if (position[0] + size / 2 > bg.left && position[0] - size / 2 < bg.left + bg.width && position[1] + size / 2 > bg.top && position[1] - size / 2 < bg.top + bg.height) {
        //console.log("inview");
        return true;
    }

    return false;
}

function screenadapt(size) {
    if (player.size <= maxscreensize)
        return size;
    else
        return size * maxscreensize / player.size;
}

function worldadapt(size) {
    if (player.size <= maxscreensize)
        return size;
    else
        return size * player.size / maxscreensize;
}

function removeClass(className) {
    var ele = document.getElementsByClassName(className);
    for (let el of ele) { el.remove(); }
}

function gameover() {
    let v = alert("游戏结束！点击以重新开始");
    location.reload();
}
init();
