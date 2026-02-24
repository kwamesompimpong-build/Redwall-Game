// ============================================================
// Redwall: The Warrior's Quest - Utility Functions
// ============================================================

const TILE_SIZE = 32;
const CANVAS_W = 960;
const CANVAS_H = 640;
const TILES_X = CANVAS_W / TILE_SIZE; // 30
const TILES_Y = CANVAS_H / TILE_SIZE; // 20

// Directions
const DIR = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

const DIR_DX = [0, 1, 0, -1];
const DIR_DY = [-1, 0, 1, 0];

// Input manager
const Input = {
    keys: {},
    justPressed: {},
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    mouseClicked: false,

    init() {
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.justPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        canvas.addEventListener('mousedown', () => { this.mouseDown = true; this.mouseClicked = true; });
        canvas.addEventListener('mouseup', () => { this.mouseDown = false; });
    },

    isDown(code) {
        return !!this.keys[code];
    },

    wasPressed(code) {
        return !!this.justPressed[code];
    },

    clearFrame() {
        this.justPressed = {};
        this.mouseClicked = false;
    },

    anyMovement() {
        return this.isDown('ArrowUp') || this.isDown('ArrowDown') ||
               this.isDown('ArrowLeft') || this.isDown('ArrowRight') ||
               this.isDown('KeyW') || this.isDown('KeyS') ||
               this.isDown('KeyA') || this.isDown('KeyD');
    },

    getDirection() {
        if (this.isDown('ArrowUp') || this.isDown('KeyW')) return DIR.UP;
        if (this.isDown('ArrowDown') || this.isDown('KeyS')) return DIR.DOWN;
        if (this.isDown('ArrowLeft') || this.isDown('KeyA')) return DIR.LEFT;
        if (this.isDown('ArrowRight') || this.isDown('KeyD')) return DIR.RIGHT;
        return -1;
    }
};

// Simple random helpers
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function choose(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Collision helpers
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Save/Load
const SaveManager = {
    save(gameState) {
        try {
            localStorage.setItem('redwall_save', JSON.stringify(gameState));
            return true;
        } catch (e) {
            return false;
        }
    },

    load() {
        try {
            const data = localStorage.getItem('redwall_save');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    hasSave() {
        return !!localStorage.getItem('redwall_save');
    },

    deleteSave() {
        localStorage.removeItem('redwall_save');
    }
};

// Particle system for effects
class Particle {
    constructor(x, y, vx, vy, life, color, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
        this.vy += 30 * dt; // gravity
    }

    draw(ctx) {
        const alpha = Math.max(0, this.life / this.maxLife);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, color, speed, life, size) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = randFloat(speed * 0.5, speed);
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * spd,
                Math.sin(angle) * spd,
                randFloat(life * 0.5, life),
                color,
                randFloat(size * 0.5, size)
            ));
        }
    }

    update(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }
}

// Screen shake
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.timer = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    shake(intensity, duration) {
        this.intensity = intensity;
        this.duration = duration;
        this.timer = duration;
    }

    update(dt) {
        if (this.timer > 0) {
            this.timer -= dt;
            const factor = this.timer / this.duration;
            this.offsetX = (Math.random() - 0.5) * this.intensity * factor * 2;
            this.offsetY = (Math.random() - 0.5) * this.intensity * factor * 2;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }
}
