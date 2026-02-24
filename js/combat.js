// ============================================================
// Redwall: The Warrior's Quest - Combat System
// ============================================================

const CombatSystem = {
    active: false,
    enemy: null,
    playerTurn: true,
    turnTimer: 0,
    actionCooldown: 0,
    combatLog: [],
    defending: false,
    specialCooldown: 0,
    result: null, // 'win', 'lose', 'flee'
    resultTimer: 0,
    animState: null, // for attack animations

    start(enemy) {
        this.active = true;
        this.enemy = enemy;
        this.playerTurn = true;
        this.turnTimer = 0;
        this.actionCooldown = 0;
        this.combatLog = [];
        this.defending = false;
        this.specialCooldown = 0;
        this.result = null;
        this.resultTimer = 0;
        this.animState = null;

        this.log(`${enemy.name} attacks!`);
        document.getElementById('combat-ui').style.display = 'block';

        if (enemy.isBoss) {
            AudioSystem.sfx.bossAppear();
            AudioSystem.music.playBoss();
        } else {
            AudioSystem.music.playCombat();
        }
    },

    end(result) {
        this.result = result;
        this.resultTimer = 2;
        document.getElementById('combat-ui').style.display = 'none';
    },

    log(msg) {
        this.combatLog.push(msg);
        if (this.combatLog.length > 4) this.combatLog.shift();
    },

    playerAttack(player, inventory, particles, screenShake) {
        if (!this.playerTurn || this.actionCooldown > 0) return;

        const atk = inventory.getAttack() + player.strength + randInt(-1, 2);
        const enemyDef = this.enemy.defense || 0;
        const damage = Math.max(1, atk - enemyDef);

        this.enemy.hp -= damage;
        this.log(`Matthias strikes for ${damage} damage!`);
        this.animState = { type: 'playerAttack', timer: 0.3 };

        AudioSystem.sfx.swordSwing();
        setTimeout(() => AudioSystem.sfx.swordHit(), 100);

        particles.emit(
            this.enemy.x * TILE_SIZE + 16,
            this.enemy.y * TILE_SIZE + 16,
            8, '#FF4444', 80, 0.5, 4
        );
        screenShake.shake(3, 0.2);

        if (this.enemy.hp <= 0) {
            this.enemy.hp = 0;
            this.log(`${this.enemy.name} is defeated!`);
            this.end('win');
            return;
        }

        this.playerTurn = false;
        this.actionCooldown = 0.8;
        this.defending = false;
    },

    playerDefend(player) {
        if (!this.playerTurn || this.actionCooldown > 0) return;

        this.defending = true;
        this.log('Matthias braces for the attack!');
        this.playerTurn = false;
        this.actionCooldown = 0.6;
    },

    playerSpecial(player, inventory, particles, screenShake) {
        if (!this.playerTurn || this.actionCooldown > 0 || this.specialCooldown > 0) return;

        const atk = (inventory.getAttack() + player.strength) * 2 + randInt(0, 4);
        const enemyDef = Math.floor((this.enemy.defense || 0) / 2);
        const damage = Math.max(2, atk - enemyDef);

        this.enemy.hp -= damage;
        this.log(`Matthias uses Warrior's Strike for ${damage} damage!`);
        this.animState = { type: 'playerSpecial', timer: 0.5 };
        this.specialCooldown = 3;

        AudioSystem.sfx.swordSwing();
        setTimeout(() => {
            AudioSystem.sfx.swordHit();
            AudioSystem.sfx.swordHit();
        }, 100);

        particles.emit(
            this.enemy.x * TILE_SIZE + 16,
            this.enemy.y * TILE_SIZE + 16,
            15, '#FFD700', 120, 0.7, 5
        );
        screenShake.shake(6, 0.3);

        if (this.enemy.hp <= 0) {
            this.enemy.hp = 0;
            this.log(`${this.enemy.name} is defeated!`);
            this.end('win');
            return;
        }

        this.playerTurn = false;
        this.actionCooldown = 1.0;
        this.defending = false;
    },

    playerFlee(player) {
        if (!this.playerTurn || this.actionCooldown > 0) return;

        // Flee chance based on level difference
        const chance = this.enemy.isBoss ? 0.1 : 0.6;
        if (Math.random() < chance) {
            this.log('Matthias escapes!');
            this.end('flee');
        } else {
            this.log('Cannot escape!');
            this.playerTurn = false;
            this.actionCooldown = 0.6;
        }
    },

    enemyTurn(player, inventory, particles, screenShake) {
        const enemy = this.enemy;
        const atk = (enemy.attack || 3) + randInt(-1, 2);
        const def = inventory.getDefense() + player.defense;
        let damage = Math.max(1, atk - def);

        if (this.defending) {
            damage = Math.max(1, Math.floor(damage / 2));
            this.log(`${enemy.name} attacks! Blocked - only ${damage} damage!`);
        } else {
            this.log(`${enemy.name} attacks for ${damage} damage!`);
        }

        player.hp -= damage;
        this.animState = { type: 'enemyAttack', timer: 0.3 };

        AudioSystem.sfx.playerHurt();
        particles.emit(
            player.x * TILE_SIZE + 16,
            player.y * TILE_SIZE + 16,
            6, '#FF0000', 60, 0.4, 3
        );
        screenShake.shake(2, 0.15);

        if (player.hp <= 0) {
            player.hp = 0;
            this.log('Matthias has fallen...');
            this.end('lose');
            return;
        }

        this.playerTurn = true;
        this.actionCooldown = 0.5;
        if (this.specialCooldown > 0) this.specialCooldown--;
    },

    update(dt, player, inventory, particles, screenShake) {
        if (!this.active) return;

        if (this.result) {
            this.resultTimer -= dt;
            if (this.resultTimer <= 0) {
                this.active = false;
            }
            return;
        }

        if (this.animState) {
            this.animState.timer -= dt;
            if (this.animState.timer <= 0) this.animState = null;
        }

        if (this.actionCooldown > 0) {
            this.actionCooldown -= dt;
            return;
        }

        if (!this.playerTurn) {
            this.enemyTurn(player, inventory, particles, screenShake);
        }
    },

    draw(ctx, player) {
        if (!this.active) return;

        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Enemy info
        const enemy = this.enemy;
        const ex = CANVAS_W / 2;
        const ey = 40;

        HUD.drawTextWithShadow(ctx, enemy.name, ex, ey, 20, enemy.isBoss ? '#FF4444' : '#FFA500', 'center');

        // Enemy HP bar
        HUD.drawBar(ctx, ex - 80, ey + 26, 160, 14, enemy.hp, enemy.maxHp, '#CC0000', '#440000');
        HUD.drawText(ctx, `${enemy.hp}/${enemy.maxHp}`, ex, ey + 27, 12, '#FFF', 'center');

        // Combat log
        let ly = CANVAS_H - 140;
        for (const msg of this.combatLog) {
            HUD.drawTextWithShadow(ctx, msg, CANVAS_W / 2, ly, 14, '#F5DEB3', 'center');
            ly += 18;
        }

        // Special cooldown indicator
        if (this.specialCooldown > 0) {
            HUD.drawText(ctx, `Special: ${this.specialCooldown} turns`, CANVAS_W / 2, CANVAS_H - 160, 12, '#888', 'center');
        } else if (this.playerTurn) {
            HUD.drawText(ctx, 'Special: Ready!', CANVAS_W / 2, CANVAS_H - 160, 12, '#FFD700', 'center');
        }

        // Result text
        if (this.result === 'win') {
            HUD.drawTextWithShadow(ctx, 'Victory!', CANVAS_W / 2, CANVAS_H / 2 - 20, 36, '#FFD700', 'center');
        } else if (this.result === 'lose') {
            HUD.drawTextWithShadow(ctx, 'Defeated...', CANVAS_W / 2, CANVAS_H / 2 - 20, 36, '#FF0000', 'center');
        } else if (this.result === 'flee') {
            HUD.drawTextWithShadow(ctx, 'Escaped!', CANVAS_W / 2, CANVAS_H / 2 - 20, 36, '#FFA500', 'center');
        }

        // Attack animation flash
        if (this.animState) {
            if (this.animState.type === 'playerAttack' || this.animState.type === 'playerSpecial') {
                ctx.fillStyle = this.animState.type === 'playerSpecial'
                    ? `rgba(255, 215, 0, ${this.animState.timer})`
                    : `rgba(255, 255, 255, ${this.animState.timer})`;
                ctx.fillRect(
                    enemy.x * TILE_SIZE - 8,
                    enemy.y * TILE_SIZE - 8,
                    48, 48
                );
            }
            if (this.animState.type === 'enemyAttack') {
                ctx.fillStyle = `rgba(255, 0, 0, ${this.animState.timer})`;
                ctx.fillRect(
                    player.x * TILE_SIZE - 4,
                    player.y * TILE_SIZE - 4,
                    40, 40
                );
            }
        }
    }
};
