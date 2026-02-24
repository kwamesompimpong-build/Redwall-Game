// ============================================================
// Redwall: The Warrior's Quest - Entity System
// ============================================================

class Player {
    constructor() {
        this.x = 14; // tile position
        this.y = 13;
        this.px = 14 * TILE_SIZE; // pixel position (for smooth movement)
        this.py = 13 * TILE_SIZE;
        this.dir = DIR.DOWN;
        this.speed = 120; // pixels per second
        this.animFrame = 0;
        this.animTimer = 0;
        this.moving = false;

        // Stats
        this.hp = 50;
        this.maxHp = 50;
        this.strength = 2;
        this.defense = 1;
        this.level = 1;
        this.xp = 0;
        this.xpToLevel = 30;

        this.interactCooldown = 0;
        this.footstepTimer = 0;
    }

    update(dt, currentMap) {
        if (this.interactCooldown > 0) this.interactCooldown -= dt;

        const dir = Input.getDirection();
        this.moving = dir >= 0;

        if (this.moving) {
            this.dir = dir;
            const dx = DIR_DX[dir] * this.speed * dt;
            const dy = DIR_DY[dir] * this.speed * dt;

            const newPx = this.px + dx;
            const newPy = this.py + dy;

            // Check collision (check corners of player bounding box)
            const margin = 6;
            const newTileX1 = Math.floor((newPx + margin) / TILE_SIZE);
            const newTileY1 = Math.floor((newPy + margin) / TILE_SIZE);
            const newTileX2 = Math.floor((newPx + TILE_SIZE - margin) / TILE_SIZE);
            const newTileY2 = Math.floor((newPy + TILE_SIZE - margin) / TILE_SIZE);

            let canMoveX = true;
            let canMoveY = true;

            // Check X movement
            const txX1 = Math.floor((newPx + margin) / TILE_SIZE);
            const txX2 = Math.floor((newPx + TILE_SIZE - margin) / TILE_SIZE);
            const tyX1 = Math.floor((this.py + margin) / TILE_SIZE);
            const tyX2 = Math.floor((this.py + TILE_SIZE - margin) / TILE_SIZE);
            if (isTileSolid(currentMap, txX1, tyX1) || isTileSolid(currentMap, txX2, tyX1) ||
                isTileSolid(currentMap, txX1, tyX2) || isTileSolid(currentMap, txX2, tyX2)) {
                canMoveX = false;
            }

            // Check Y movement
            const txY1 = Math.floor((this.px + margin) / TILE_SIZE);
            const txY2 = Math.floor((this.px + TILE_SIZE - margin) / TILE_SIZE);
            const tyY1 = Math.floor((newPy + margin) / TILE_SIZE);
            const tyY2 = Math.floor((newPy + TILE_SIZE - margin) / TILE_SIZE);
            if (isTileSolid(currentMap, txY1, tyY1) || isTileSolid(currentMap, txY2, tyY1) ||
                isTileSolid(currentMap, txY1, tyY2) || isTileSolid(currentMap, txY2, tyY2)) {
                canMoveY = false;
            }

            if (canMoveX) this.px = newPx;
            if (canMoveY) this.py = newPy;

            // Clamp to map bounds
            this.px = clamp(this.px, 0, (30 - 1) * TILE_SIZE);
            this.py = clamp(this.py, 0, (20 - 1) * TILE_SIZE);

            // Update tile position
            this.x = Math.floor((this.px + TILE_SIZE / 2) / TILE_SIZE);
            this.y = Math.floor((this.py + TILE_SIZE / 2) / TILE_SIZE);

            // Animation
            this.animTimer += dt;
            if (this.animTimer > 0.15) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }

            // Footsteps
            this.footstepTimer += dt;
            if (this.footstepTimer > 0.35) {
                this.footstepTimer = 0;
                AudioSystem.sfx.footstep();
            }
        } else {
            this.animFrame = 0;
            this.footstepTimer = 0.3;
        }
    }

    draw(ctx) {
        const spriteName = `player_${this.dir}_${this.animFrame}`;
        SpriteRenderer.draw(ctx, spriteName, Math.floor(this.px), Math.floor(this.py), TILE_SIZE, TILE_SIZE,
            (sctx, w, h) => CharSprites.matthias(sctx, w, h, this.dir, this.animFrame));
    }

    addXP(amount) {
        this.xp += amount;
        let leveled = false;
        while (this.xp >= this.xpToLevel) {
            this.xp -= this.xpToLevel;
            this.level++;
            this.maxHp += 10;
            this.hp = this.maxHp;
            this.strength += 1;
            this.defense += 1;
            this.xpToLevel = Math.floor(this.xpToLevel * 1.5);
            leveled = true;
        }
        return leveled;
    }

    serialize() {
        return {
            x: this.x, y: this.y, dir: this.dir,
            hp: this.hp, maxHp: this.maxHp,
            strength: this.strength, defense: this.defense,
            level: this.level, xp: this.xp, xpToLevel: this.xpToLevel
        };
    }

    deserialize(data) {
        this.x = data.x; this.y = data.y;
        this.px = data.x * TILE_SIZE; this.py = data.y * TILE_SIZE;
        this.dir = data.dir;
        this.hp = data.hp; this.maxHp = data.maxHp;
        this.strength = data.strength; this.defense = data.defense;
        this.level = data.level; this.xp = data.xp; this.xpToLevel = data.xpToLevel;
    }
}

class Enemy {
    constructor(data, mapKey) {
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.px = data.x * TILE_SIZE;
        this.py = data.y * TILE_SIZE;
        this.dir = DIR.DOWN;
        this.patrol = data.patrol;
        this.mapKey = mapKey;
        this.alive = true;
        this.respawnTimer = 0;
        this.respawnTime = 30; // seconds

        // Movement
        this.patrolTimer = 0;
        this.patrolDir = randInt(0, 3);
        this.moveTimer = 0;
        this.animFrame = 0;

        // Stats based on type
        this.setupStats();
    }

    setupStats() {
        switch (this.type) {
            case 'rat':
                this.name = choose(['Rat Soldier', 'Rat Scout', 'Rat Guard']);
                this.maxHp = 20;
                this.hp = 20;
                this.attack = 4;
                this.defense = 1;
                this.xpReward = 10;
                break;
            case 'weasel':
                this.name = choose(['Weasel Fighter', 'Weasel Raider']);
                this.maxHp = 28;
                this.hp = 28;
                this.attack = 5;
                this.defense = 2;
                this.xpReward = 15;
                break;
            case 'ferret':
                this.name = choose(['Ferret Warrior', 'Ferret Captain']);
                this.maxHp = 35;
                this.hp = 35;
                this.attack = 6;
                this.defense = 3;
                this.xpReward = 20;
                break;
            default:
                this.name = 'Vermin';
                this.maxHp = 15;
                this.hp = 15;
                this.attack = 3;
                this.defense = 0;
                this.xpReward = 8;
        }
    }

    update(dt, currentMap) {
        if (!this.alive) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.alive = true;
                this.hp = this.maxHp;
            }
            return;
        }

        if (!this.patrol) return;

        // Simple patrol AI
        this.patrolTimer += dt;
        if (this.patrolTimer > 2 + Math.random() * 2) {
            this.patrolTimer = 0;
            this.patrolDir = randInt(0, 3);
        }

        this.moveTimer += dt;
        if (this.moveTimer > 0.5) {
            this.moveTimer = 0;

            const newX = this.x + DIR_DX[this.patrolDir];
            const newY = this.y + DIR_DY[this.patrolDir];

            if (newX >= 0 && newX < 30 && newY >= 0 && newY < 20 &&
                !isTileSolid(currentMap, newX, newY)) {
                this.x = newX;
                this.y = newY;
                this.px = newX * TILE_SIZE;
                this.py = newY * TILE_SIZE;
                this.dir = this.patrolDir;
            } else {
                this.patrolDir = randInt(0, 3);
            }

            this.animFrame = (this.animFrame + 1) % 2;
        }
    }

    draw(ctx) {
        if (!this.alive) return;

        const drawFn = CharSprites[this.type];
        if (drawFn) {
            const spriteName = `enemy_${this.type}_${this.dir}_${this.animFrame}`;
            SpriteRenderer.draw(ctx, spriteName, Math.floor(this.px), Math.floor(this.py), TILE_SIZE, TILE_SIZE,
                (sctx, w, h) => drawFn(sctx, w, h, this.dir, this.animFrame));
        }

        // Small HP bar above enemy
        if (this.hp < this.maxHp) {
            HUD.drawBar(ctx, this.px + 4, this.py - 6, 24, 4, this.hp, this.maxHp, '#CC0000', '#440000');
        }
    }

    kill() {
        this.alive = false;
        this.respawnTimer = this.respawnTime;
    }
}

class NPC {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.dialogue = data.dialogue;
        this.quest = data.quest;
        this.isBoss = data.isBoss || false;
        this.robeColor = data.robeColor;
        this.dir = DIR.DOWN;
        this.animFrame = 0;
        this.animTimer = 0;
        this.interacted = false;
    }

    update(dt) {
        this.animTimer += dt;
        if (this.animTimer > 0.5) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }
    }

    draw(ctx) {
        let drawFn;
        const type = this.type;

        switch (type) {
            case 'mouse':
                drawFn = (sctx, w, h) => CharSprites.mouse(sctx, w, h, this.dir, this.animFrame, this.robeColor);
                break;
            case 'badger':
                drawFn = (sctx, w, h) => CharSprites.badger(sctx, w, h, this.dir, this.animFrame);
                break;
            case 'sparrow':
                drawFn = (sctx, w, h) => CharSprites.sparrow(sctx, w, h);
                break;
            case 'otter':
                drawFn = (sctx, w, h) => CharSprites.otter(sctx, w, h);
                break;
            case 'cluny':
                drawFn = (sctx, w, h) => CharSprites.cluny(sctx, w, h, this.dir, this.animFrame);
                break;
            default:
                drawFn = (sctx, w, h) => CharSprites.mouse(sctx, w, h, this.dir, this.animFrame, '#8B4513');
        }

        const spriteName = `npc_${this.id}_${this.animFrame}`;
        SpriteRenderer.draw(ctx, spriteName, this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE, drawFn);

        // Name tag
        HUD.drawTextWithShadow(ctx, this.name, this.x * TILE_SIZE + 16, this.y * TILE_SIZE - 12, 10,
            this.isBoss ? '#FF4444' : '#FFD700', 'center');
    }
}

class MapItem {
    constructor(data) {
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.itemId = data.itemId;
        this.respawn = data.respawn;
        this.collected = false;
        this.respawnTimer = 0;
        this.animFrame = 0;
    }

    update(dt) {
        this.animFrame += dt * 5;
        if (this.collected && this.respawn) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.collected = false;
            }
        }
    }

    draw(ctx) {
        if (this.collected) return;

        const dbItem = ItemDB[this.itemId];
        if (!dbItem) return;

        // Draw sparkle effect
        SpriteRenderer.draw(ctx, `item_sparkle_${Math.floor(this.animFrame) % 8}`,
            this.x * TILE_SIZE, this.y * TILE_SIZE, TILE_SIZE, TILE_SIZE,
            (sctx, w, h) => CharSprites.itemPickup(sctx, w, h, this.animFrame));

        // Draw item icon
        ctx.font = '16px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(dbItem.icon, this.x * TILE_SIZE + 16, this.y * TILE_SIZE + 20);
    }

    collect() {
        this.collected = true;
        if (this.respawn) {
            this.respawnTimer = 20;
        }
    }
}
