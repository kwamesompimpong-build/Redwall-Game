// ============================================================
// Redwall: The Warrior's Quest - Main Game Engine
// ============================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        // Game state
        this.state = 'title'; // title, playing, paused, gameover, victory
        this.currentMapKey = 'abbey_grounds';
        this.currentMap = null;

        // Core systems
        this.player = new Player();
        this.inventory = new Inventory();
        this.questSystem = new QuestSystem();
        this.dialogueSystem = new DialogueSystem();
        this.particles = new ParticleSystem();
        this.screenShake = new ScreenShake();

        // Map entities (populated per map)
        this.enemies = [];
        this.npcs = [];
        this.mapItems = [];

        // Killed enemies tracking (persists across map loads)
        this.killedEnemies = {};
        this.collectedItems = {};

        // UI state
        this.inventoryOpen = false;
        this.questLogOpen = false;
        this.menuOpen = false;
        this.notificationTimer = 0;

        // Title screen
        this.titleSelection = 0;
        this.titleAnimTimer = 0;

        // Transition
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionTarget = null;
        this.transitionPhase = 'none'; // 'out', 'in'

        // Time tracking
        this.lastTime = 0;
        this.gameTime = 0;

        // Found sword flag
        this.hasMartinSword = false;

        window.gameInstance = this;
    }

    init() {
        Input.init();
        AudioSystem.init();
        initMaps();

        this.loadMap('abbey_grounds');
        this.player.x = 14;
        this.player.y = 13;
        this.player.px = 14 * TILE_SIZE;
        this.player.py = 13 * TILE_SIZE;

        // Set up combat buttons
        document.getElementById('btn-attack').addEventListener('click', () => {
            if (CombatSystem.active) {
                CombatSystem.playerAttack(this.player, this.inventory, this.particles, this.screenShake);
            }
        });
        document.getElementById('btn-defend').addEventListener('click', () => {
            if (CombatSystem.active) {
                CombatSystem.playerDefend(this.player);
            }
        });
        document.getElementById('btn-special').addEventListener('click', () => {
            if (CombatSystem.active) {
                CombatSystem.playerSpecial(this.player, this.inventory, this.particles, this.screenShake);
            }
        });
        document.getElementById('btn-flee').addEventListener('click', () => {
            if (CombatSystem.active) {
                CombatSystem.playerFlee(this.player);
            }
        });

        // Click handler for dialogue
        this.canvas.addEventListener('click', () => {
            AudioSystem.resume();
            if (this.state === 'title') {
                this.handleTitleInput();
            }
            if (this.dialogueSystem.active) {
                this.handleDialogueResult(this.dialogueSystem.advance());
            }
        });

        // Start the game loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    loadMap(mapKey) {
        this.currentMapKey = mapKey;
        this.currentMap = Maps[mapKey];

        // Load enemies
        this.enemies = [];
        for (const eData of this.currentMap.enemies) {
            const enemy = new Enemy(eData, mapKey);
            const killKey = `${mapKey}_${eData.x}_${eData.y}`;
            if (this.killedEnemies[killKey]) {
                enemy.alive = false;
                enemy.respawnTimer = enemy.respawnTime;
            }
            this.enemies.push(enemy);
        }

        // Load NPCs
        this.npcs = [];
        for (const nData of this.currentMap.npcs) {
            this.npcs.push(new NPC(nData));
        }

        // Load items
        this.mapItems = [];
        for (const iData of this.currentMap.items) {
            const item = new MapItem(iData);
            if (this.collectedItems[iData.id] && !iData.respawn) {
                item.collected = true;
            }
            this.mapItems.push(item);
        }
    }

    showNotification(text) {
        const notif = document.getElementById('notification');
        notif.textContent = text;
        notif.style.display = 'block';
        notif.style.animation = 'none';
        notif.offsetHeight; // Trigger reflow
        notif.style.animation = 'fadeInOut 3s forwards';
        this.notificationTimer = 3;
    }

    gameLoop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        Input.clearFrame();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        if (this.notificationTimer > 0) {
            this.notificationTimer -= dt;
            if (this.notificationTimer <= 0) {
                document.getElementById('notification').style.display = 'none';
            }
        }

        switch (this.state) {
            case 'title': this.updateTitle(dt); break;
            case 'playing': this.updatePlaying(dt); break;
            case 'gameover': this.updateGameOver(dt); break;
            case 'victory': this.updateVictory(dt); break;
        }
    }

    // ============ TITLE SCREEN ============
    updateTitle(dt) {
        this.titleAnimTimer += dt;

        if (Input.wasPressed('ArrowUp') || Input.wasPressed('KeyW')) {
            this.titleSelection = Math.max(0, this.titleSelection - 1);
            AudioSystem.sfx.menuSelect();
        }
        if (Input.wasPressed('ArrowDown') || Input.wasPressed('KeyS')) {
            this.titleSelection = Math.min(SaveManager.hasSave() ? 2 : 1, this.titleSelection + 1);
            AudioSystem.sfx.menuSelect();
        }
        if (Input.wasPressed('Space') || Input.wasPressed('Enter')) {
            this.handleTitleInput();
        }
    }

    handleTitleInput() {
        AudioSystem.resume();
        AudioSystem.sfx.menuConfirm();

        if (this.titleSelection === 0) {
            // New Game
            this.state = 'playing';
            AudioSystem.music.playExploration();
            this.showNotification('Welcome to Redwall Abbey, Matthias!');
        } else if (this.titleSelection === 1 && SaveManager.hasSave()) {
            // Continue
            this.loadGame();
            this.state = 'playing';
            AudioSystem.music.playExploration();
            this.showNotification('Welcome back, Matthias!');
        }
    }

    drawTitle() {
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#1a0a00';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Decorative border
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, CANVAS_W - 40, CANVAS_H - 40);
        ctx.strokeStyle = '#CD853F';
        ctx.lineWidth = 2;
        ctx.strokeRect(28, 28, CANVAS_W - 56, CANVAS_H - 56);

        // Draw decorative abbey silhouette
        ctx.fillStyle = '#2a1400';
        // Central tower
        ctx.fillRect(430, 180, 100, 200);
        ctx.fillRect(450, 140, 60, 50);
        ctx.fillRect(465, 110, 30, 40);
        // Side buildings
        ctx.fillRect(330, 260, 100, 120);
        ctx.fillRect(530, 260, 100, 120);
        // Windows
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(470, 200, 8, 12);
        ctx.fillRect(490, 200, 8, 12);
        ctx.fillRect(475, 160, 10, 14);
        ctx.fillRect(360, 290, 6, 10);
        ctx.fillRect(380, 290, 6, 10);
        ctx.fillRect(400, 290, 6, 10);
        ctx.fillRect(555, 290, 6, 10);
        ctx.fillRect(575, 290, 6, 10);
        ctx.fillRect(595, 290, 6, 10);

        // Ground
        ctx.fillStyle = '#2a1400';
        ctx.fillRect(100, 380, 760, 20);

        // Title
        const titleY = 60 + Math.sin(this.titleAnimTimer * 1.5) * 5;

        ctx.fillStyle = '#000';
        ctx.font = 'bold 56px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('REDWALL', CANVAS_W / 2 + 2, titleY + 2);
        ctx.fillStyle = '#CD853F';
        ctx.fillText('REDWALL', CANVAS_W / 2, titleY);

        ctx.font = '24px Georgia, serif';
        ctx.fillStyle = '#000';
        ctx.fillText("The Warrior's Quest", CANVAS_W / 2 + 1, titleY + 41);
        ctx.fillStyle = '#DAA520';
        ctx.fillText("The Warrior's Quest", CANVAS_W / 2, titleY + 40);

        // Quote
        ctx.font = 'italic 14px Georgia, serif';
        ctx.fillStyle = '#8B6914';
        ctx.fillText('"Who says that I am dead / Knows nought at all"', CANVAS_W / 2, titleY + 70);

        // Menu options
        const menuY = 430;
        const options = ['New Game'];
        if (SaveManager.hasSave()) options.push('Continue');
        options.push('Controls');

        for (let i = 0; i < options.length; i++) {
            const selected = i === this.titleSelection;
            const y = menuY + i * 44;

            if (selected) {
                ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
                ctx.fillRect(CANVAS_W / 2 - 140, y - 8, 280, 36);
                ctx.strokeStyle = '#DAA520';
                ctx.lineWidth = 2;
                ctx.strokeRect(CANVAS_W / 2 - 140, y - 8, 280, 36);
            }

            ctx.font = selected ? 'bold 22px Georgia, serif' : '20px Georgia, serif';
            ctx.fillStyle = selected ? '#FFD700' : '#CD853F';
            ctx.fillText(options[i], CANVAS_W / 2, y + 18);

            if (selected) {
                ctx.fillText('\u25B6', CANVAS_W / 2 - 120, y + 18);
                ctx.fillText('\u25C0', CANVAS_W / 2 + 120, y + 18);
            }
        }

        // Credits
        ctx.font = '12px Georgia, serif';
        ctx.fillStyle = '#5C3A1E';
        ctx.fillText('Based on the Redwall series by Brian Jacques', CANVAS_W / 2, CANVAS_H - 50);
        ctx.fillText('WASD/Arrows: Navigate | SPACE/Enter: Select', CANVAS_W / 2, CANVAS_H - 34);
    }

    // ============ PLAYING STATE ============
    updatePlaying(dt) {
        // Handle UI toggles
        if (Input.wasPressed('Escape')) {
            if (this.inventoryOpen) { this.toggleInventory(); }
            else if (this.questLogOpen) { this.toggleQuestLog(); }
            else if (this.dialogueSystem.active) { /* don't close dialogue with ESC */ }
            else { this.toggleMenu(); }
            return;
        }

        if (this.menuOpen) return;

        if (Input.wasPressed('KeyI') && !this.dialogueSystem.active && !CombatSystem.active) {
            this.toggleInventory();
            return;
        }
        if (Input.wasPressed('KeyQ') && !this.dialogueSystem.active && !CombatSystem.active) {
            this.toggleQuestLog();
            return;
        }

        if (this.inventoryOpen || this.questLogOpen) return;

        // Handle transitions
        if (this.transitioning) {
            this.updateTransition(dt);
            return;
        }

        // Combat
        if (CombatSystem.active) {
            CombatSystem.update(dt, this.player, this.inventory, this.particles, this.screenShake);

            // Combat input
            if (CombatSystem.playerTurn && !CombatSystem.result) {
                if (Input.wasPressed('KeyA') || Input.wasPressed('Digit1')) {
                    CombatSystem.playerAttack(this.player, this.inventory, this.particles, this.screenShake);
                }
                if (Input.wasPressed('KeyD') || Input.wasPressed('Digit2')) {
                    CombatSystem.playerDefend(this.player);
                }
                if (Input.wasPressed('KeyS') || Input.wasPressed('Digit3')) {
                    CombatSystem.playerSpecial(this.player, this.inventory, this.particles, this.screenShake);
                }
                if (Input.wasPressed('KeyF') || Input.wasPressed('Digit4')) {
                    CombatSystem.playerFlee(this.player);
                }
            }

            // Combat ended
            if (!CombatSystem.active) {
                this.handleCombatEnd(CombatSystem.result);
            }

            this.particles.update(dt);
            this.screenShake.update(dt);
            return;
        }

        // Dialogue
        if (this.dialogueSystem.active) {
            this.dialogueSystem.update(dt);
            if (Input.wasPressed('Space') || Input.wasPressed('Enter')) {
                this.handleDialogueResult(this.dialogueSystem.advance());
            }
            return;
        }

        // Player movement and interaction
        this.player.update(dt, this.currentMap);

        // Update entities
        for (const enemy of this.enemies) enemy.update(dt, this.currentMap);
        for (const npc of this.npcs) npc.update(dt);
        for (const item of this.mapItems) item.update(dt);

        // Check enemy collision (start combat)
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            if (Math.abs(this.player.x - enemy.x) <= 1 && Math.abs(this.player.y - enemy.y) <= 1) {
                CombatSystem.start(enemy);
                break;
            }
        }

        // Check item pickup
        for (const item of this.mapItems) {
            if (item.collected) continue;
            if (this.player.x === item.x && this.player.y === item.y) {
                const dbItem = ItemDB[item.itemId];
                if (dbItem && this.inventory.addItem(item.itemId)) {
                    item.collect();
                    this.collectedItems[item.id] = true;
                    AudioSystem.sfx.pickup();
                    this.showNotification(`Found: ${dbItem.name}!`);
                }
            }
        }

        // Check interaction (SPACE)
        if (Input.wasPressed('Space') && this.player.interactCooldown <= 0) {
            this.tryInteract();
            this.player.interactCooldown = 0.3;
        }

        // Check map transitions
        this.checkTransitions();

        this.particles.update(dt);
        this.screenShake.update(dt);
        this.gameTime += dt;
    }

    tryInteract() {
        const facingX = this.player.x + DIR_DX[this.player.dir];
        const facingY = this.player.y + DIR_DY[this.player.dir];

        // Check NPCs
        for (const npc of this.npcs) {
            if ((npc.x === facingX && npc.y === facingY) ||
                (npc.x === this.player.x && npc.y === this.player.y)) {
                // Face the player
                npc.dir = [DIR.DOWN, DIR.LEFT, DIR.UP, DIR.RIGHT][this.player.dir];
                this.startNPCDialogue(npc);
                return;
            }
        }

        // Check chests
        const tile = getTile(this.currentMap, facingX, facingY);
        if (tile === 9) {
            // Chest - check if there's an item here
            for (const item of this.mapItems) {
                if (!item.collected && item.x === facingX && item.y === facingY) {
                    const dbItem = ItemDB[item.itemId];
                    if (dbItem && this.inventory.addItem(item.itemId)) {
                        item.collect();
                        this.collectedItems[item.id] = true;
                        AudioSystem.sfx.pickup();
                        this.showNotification(`Found: ${dbItem.name}!`);
                    }
                    return;
                }
            }
        }
    }

    startNPCDialogue(npc) {
        let dialogueId = npc.dialogue;

        // Check for quest-specific dialogue
        if (npc.id === 'abbot' && this.questSystem.isQuestActive('main_quest')) {
            dialogueId = 'abbot_after_quest';
        }
        if (npc.id === 'methuselah' && this.questSystem.isQuestActive('find_sword')) {
            dialogueId = 'methuselah_after_quest';
        }
        if (npc.id === 'cluny') {
            if (this.questSystem.getFlag('cluny_defeated')) return;
        }

        this.dialogueSystem.start(dialogueId, npc.id);
    }

    handleDialogueResult(result) {
        if (!result) return;

        // Give items
        if (result.giveItem) {
            const dbItem = ItemDB[result.giveItem.itemId];
            if (dbItem) {
                this.inventory.addItem(result.giveItem.itemId, result.giveItem.count);
                this.showNotification(`Received: ${dbItem.name} x${result.giveItem.count || 1}!`);
                AudioSystem.sfx.pickup();
            }
        }

        // Handle quest triggers
        if (result.onComplete) {
            switch (result.onComplete) {
                case 'start_main_quest':
                    if (this.questSystem.startQuest('main_quest')) {
                        this.showNotification('New Quest: Defend Redwall Abbey!');
                        AudioSystem.sfx.questComplete();
                    }
                    break;

                case 'start_sword_quest':
                    if (this.questSystem.startQuest('find_sword')) {
                        this.showNotification('New Quest: The Sword of Martin!');
                        AudioSystem.sfx.questComplete();
                    }
                    if (this.questSystem.isQuestActive('main_quest')) {
                        this.questSystem.advanceQuest('main_quest');
                    }
                    break;

                case 'start_otter_quest':
                    if (this.questSystem.startQuest('otter_help')) {
                        this.showNotification('New Quest: Rally the Otters!');
                        AudioSystem.sfx.questComplete();
                    }
                    break;

                case 'start_boss_fight':
                    // Start boss fight with Cluny
                    const clunyNpc = this.npcs.find(n => n.id === 'cluny');
                    if (clunyNpc) {
                        const bossEnemy = {
                            name: 'Cluny the Scourge',
                            hp: 120,
                            maxHp: 120,
                            attack: 12,
                            defense: 5,
                            x: clunyNpc.x,
                            y: clunyNpc.y,
                            isBoss: true,
                            xpReward: 100
                        };
                        CombatSystem.start(bossEnemy);
                        this._bossFightActive = true;
                    }
                    break;
            }
        }
    }

    handleCombatEnd(result) {
        if (result === 'win') {
            const enemy = CombatSystem.enemy;

            // Award XP
            const xpAmount = enemy.xpReward || 10;
            const leveled = this.player.addXP(xpAmount);
            this.showNotification(`Victory! +${xpAmount} XP` + (leveled ? ` Level Up! (Lvl ${this.player.level})` : ''));

            if (leveled) {
                AudioSystem.sfx.levelUp();
            } else {
                AudioSystem.sfx.questComplete();
            }

            AudioSystem.music.playExploration();

            // Mark enemy as killed
            if (enemy.mapKey) {
                const killKey = `${enemy.mapKey}_${enemy.x}_${enemy.y}`;
                this.killedEnemies[killKey] = true;
            }

            // Remove enemy from map
            for (const e of this.enemies) {
                if (e.x === enemy.x && e.y === enemy.y && e.alive !== false) {
                    e.kill();
                    AudioSystem.sfx.enemyDeath();
                    this.particles.emit(e.px + 16, e.py + 16, 20, '#FF4444', 100, 0.8, 4);
                    break;
                }
            }

            // Check boss kill
            if (this._bossFightActive) {
                this._bossFightActive = false;
                this.questSystem.setFlag('cluny_defeated', true);
                // Advance main quest
                if (this.questSystem.isQuestActive('main_quest')) {
                    this.questSystem.advanceQuest('main_quest');
                    this.questSystem.advanceQuest('main_quest');
                }
                // Victory!
                setTimeout(() => {
                    this.state = 'victory';
                    AudioSystem.music.playVictory();
                }, 1500);
            }

            // Check otter quest
            if (this.currentMapKey === 'mossflower_deep') {
                const aliveEnemies = this.enemies.filter(e => e.alive);
                if (aliveEnemies.length === 0 && this.questSystem.isQuestActive('otter_help')) {
                    this.questSystem.advanceQuest('otter_help');
                    this.showNotification('The deep woods are clear! Return to Skipper.');
                }
            }

            // Drop loot
            if (Math.random() < 0.4) {
                const lootTable = ['healing_herb', 'healing_herb', 'healing_ale'];
                const loot = choose(lootTable);
                const dbItem = ItemDB[loot];
                if (dbItem) {
                    this.inventory.addItem(loot);
                    this.showNotification(`Loot: ${dbItem.name}!`);
                }
            }
        } else if (result === 'lose') {
            AudioSystem.music.stop();
            this.state = 'gameover';
        } else if (result === 'flee') {
            AudioSystem.music.playExploration();
            // Move player back
            this.player.x = clamp(this.player.x + DIR_DX[(this.player.dir + 2) % 4] * 2, 1, 28);
            this.player.y = clamp(this.player.y + DIR_DY[(this.player.dir + 2) % 4] * 2, 1, 18);
            this.player.px = this.player.x * TILE_SIZE;
            this.player.py = this.player.y * TILE_SIZE;
        }
    }

    checkTransitions() {
        if (!this.currentMap.transitions) return;

        for (const trans of this.currentMap.transitions) {
            for (const tile of trans.tiles) {
                if (this.player.x === tile.x && this.player.y === tile.y) {
                    this.startTransition(trans.toMap, trans.toX, trans.toY);
                    return;
                }
            }
        }
    }

    startTransition(toMap, toX, toY) {
        if (this.transitioning) return;

        // Check if map has Martin's sword (special for tunnels)
        if (toMap === 'abbey_tunnels' && this.questSystem.isQuestActive('find_sword')) {
            const stage = this.questSystem.getCurrentStageId('find_sword');
            if (stage === 'search_cellars') {
                this.questSystem.advanceQuest('find_sword');
            }
        }

        this.transitioning = true;
        this.transitionAlpha = 0;
        this.transitionPhase = 'out';
        this.transitionTarget = { map: toMap, x: toX, y: toY };
        AudioSystem.sfx.doorOpen();
    }

    updateTransition(dt) {
        if (this.transitionPhase === 'out') {
            this.transitionAlpha += dt * 3;
            if (this.transitionAlpha >= 1) {
                this.transitionAlpha = 1;
                this.transitionPhase = 'in';

                // Actually change map
                this.loadMap(this.transitionTarget.map);
                this.player.x = this.transitionTarget.x;
                this.player.y = this.transitionTarget.y;
                this.player.px = this.transitionTarget.x * TILE_SIZE;
                this.player.py = this.transitionTarget.y * TILE_SIZE;

                this.showNotification(this.currentMap.name);

                // Advance belltower quest stage
                if (this.transitionTarget.map === 'abbey_upper' && this.questSystem.isQuestActive('find_sword')) {
                    const stage = this.questSystem.getCurrentStageId('find_sword');
                    if (stage === 'search_belltower') {
                        this.questSystem.advanceQuest('find_sword');
                    }
                }

                // Sword find in tunnels
                if (this.transitionTarget.map === 'abbey_tunnels' && this.questSystem.isQuestActive('find_sword')) {
                    const stage = this.questSystem.getCurrentStageId('find_sword');
                    if (stage === 'find_sword_tunnel') {
                        setTimeout(() => {
                            this.inventory.addItem('martin_sword');
                            this.inventory.useItem('martin_sword', this.player);
                            this.inventory.addItem('martin_shield');
                            this.inventory.useItem('martin_shield', this.player);
                            this.hasMartinSword = true;
                            this.questSystem.advanceQuest('find_sword');
                            this.questSystem.setFlag('has_martin_sword', true);
                            if (this.questSystem.isQuestActive('main_quest')) {
                                this.questSystem.advanceQuest('main_quest');
                            }
                            this.showNotification("Found the Sword of Martin the Warrior!");
                            AudioSystem.sfx.questComplete();
                            this.particles.emit(this.player.px + 16, this.player.py + 16, 30, '#FFD700', 150, 1.5, 6);
                        }, 1000);
                    }
                }
            }
        } else if (this.transitionPhase === 'in') {
            this.transitionAlpha -= dt * 3;
            if (this.transitionAlpha <= 0) {
                this.transitionAlpha = 0;
                this.transitioning = false;
                this.transitionPhase = 'none';
            }
        }
    }

    toggleInventory() {
        this.inventoryOpen = !this.inventoryOpen;
        const panel = document.getElementById('inventory-panel');
        if (this.inventoryOpen) {
            panel.style.display = 'block';
            document.getElementById('ui-overlay').classList.add('active');
            renderInventoryUI(this.inventory);
            AudioSystem.sfx.menuConfirm();
        } else {
            panel.style.display = 'none';
            document.getElementById('ui-overlay').classList.remove('active');
        }
    }

    toggleQuestLog() {
        this.questLogOpen = !this.questLogOpen;
        const panel = document.getElementById('quest-log');
        if (this.questLogOpen) {
            panel.style.display = 'block';
            document.getElementById('ui-overlay').classList.add('active');
            renderQuestLog(this.questSystem);
            AudioSystem.sfx.menuConfirm();
        } else {
            panel.style.display = 'none';
            document.getElementById('ui-overlay').classList.remove('active');
        }
    }

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
        const menu = document.getElementById('game-menu');
        if (this.menuOpen) {
            menu.style.display = 'block';
            document.getElementById('ui-overlay').classList.add('active');
            menu.innerHTML = `
                <button class="menu-btn" id="menu-resume">Resume</button>
                <button class="menu-btn" id="menu-save">Save Game</button>
                <button class="menu-btn" id="menu-quit">Quit to Title</button>
            `;
            document.getElementById('menu-resume').addEventListener('click', () => this.toggleMenu());
            document.getElementById('menu-save').addEventListener('click', () => {
                this.saveGame();
                this.showNotification('Game Saved!');
                this.toggleMenu();
            });
            document.getElementById('menu-quit').addEventListener('click', () => {
                this.toggleMenu();
                this.state = 'title';
                this.titleSelection = 0;
                AudioSystem.music.stop();
                AudioSystem.music.playTitle();
            });
        } else {
            menu.style.display = 'none';
            document.getElementById('ui-overlay').classList.remove('active');
        }
    }

    saveGame() {
        const state = {
            player: this.player.serialize(),
            inventory: this.inventory.serialize(),
            quests: this.questSystem.serialize(),
            currentMap: this.currentMapKey,
            killedEnemies: this.killedEnemies,
            collectedItems: this.collectedItems,
            hasMartinSword: this.hasMartinSword,
            gameTime: this.gameTime
        };
        SaveManager.save(state);
    }

    loadGame() {
        const state = SaveManager.load();
        if (!state) return;

        this.player.deserialize(state.player);
        this.inventory.deserialize(state.inventory);
        this.questSystem.deserialize(state.quests);
        this.killedEnemies = state.killedEnemies || {};
        this.collectedItems = state.collectedItems || {};
        this.hasMartinSword = state.hasMartinSword || false;
        this.gameTime = state.gameTime || 0;
        this.loadMap(state.currentMap);
    }

    // ============ GAME OVER ============
    updateGameOver(dt) {
        if (Input.wasPressed('Space') || Input.wasPressed('Enter')) {
            // Resurrect at abbey
            this.player.hp = Math.floor(this.player.maxHp / 2);
            this.loadMap('abbey_grounds');
            this.player.x = 14;
            this.player.y = 13;
            this.player.px = 14 * TILE_SIZE;
            this.player.py = 13 * TILE_SIZE;
            this.state = 'playing';
            AudioSystem.music.playExploration();
        }
    }

    // ============ VICTORY ============
    updateVictory(dt) {
        this.titleAnimTimer += dt;
        if (Input.wasPressed('Space') || Input.wasPressed('Enter')) {
            this.state = 'title';
            AudioSystem.music.stop();
        }
    }

    // ============ DRAWING ============
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        switch (this.state) {
            case 'title':
                this.drawTitle();
                break;
            case 'playing':
                this.drawPlaying();
                break;
            case 'gameover':
                this.drawPlaying();
                this.drawGameOver();
                break;
            case 'victory':
                this.drawVictory();
                break;
        }
    }

    drawPlaying() {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(Math.floor(this.screenShake.offsetX), Math.floor(this.screenShake.offsetY));

        // Draw map
        renderMap(ctx, this.currentMap, this.gameTime);

        // Draw items
        for (const item of this.mapItems) item.draw(ctx);

        // Draw NPCs
        for (const npc of this.npcs) npc.draw(ctx);

        // Draw enemies
        for (const enemy of this.enemies) enemy.draw(ctx);

        // Draw player
        this.player.draw(ctx);

        // Draw particles
        this.particles.draw(ctx);

        ctx.restore();

        // Draw HUD
        this.drawHUD();

        // Draw combat overlay
        if (CombatSystem.active) {
            CombatSystem.draw(ctx, this.player);
        }

        // Draw transition fade
        if (this.transitioning) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }
    }

    drawHUD() {
        const ctx = this.ctx;
        const p = this.player;

        // Background panel
        ctx.fillStyle = 'rgba(20, 10, 2, 0.75)';
        ctx.fillRect(8, 8, 220, 60);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 220, 60);

        // Player name and level
        HUD.drawTextWithShadow(ctx, `Matthias  Lv.${p.level}`, 16, 12, 14, '#FFD700');

        // HP bar
        HUD.drawText(ctx, 'HP', 16, 30, 12, '#F5DEB3');
        HUD.drawBar(ctx, 36, 30, 140, 12, p.hp, p.maxHp, '#CC3333', '#441111');
        HUD.drawText(ctx, `${p.hp}/${p.maxHp}`, 180, 30, 10, '#FFF');

        // XP bar
        HUD.drawText(ctx, 'XP', 16, 46, 12, '#F5DEB3');
        HUD.drawBar(ctx, 36, 46, 140, 10, p.xp, p.xpToLevel, '#3366CC', '#112244');

        // Map name
        HUD.drawTextWithShadow(ctx, this.currentMap.name, CANVAS_W - 16, 14, 13, '#CD853F', 'right');

        // Minimap indicator
        const weaponName = ItemDB[this.inventory.equipped.weapon]?.name || 'None';
        HUD.drawTextWithShadow(ctx, `\u2694 ${weaponName}`, CANVAS_W - 16, 32, 11, '#A0A0A0', 'right');

        if (this.inventory.equipped.shield) {
            const shieldName = ItemDB[this.inventory.equipped.shield]?.name || '';
            HUD.drawTextWithShadow(ctx, `\uD83D\uDEE1 ${shieldName}`, CANVAS_W - 16, 46, 11, '#A0A0A0', 'right');
        }
    }

    drawGameOver() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.font = 'bold 48px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#8B0000';
        ctx.fillText('FALLEN IN BATTLE', CANVAS_W / 2, CANVAS_H / 2 - 30);

        ctx.font = '20px Georgia, serif';
        ctx.fillStyle = '#CD853F';
        ctx.fillText('But the spirit of Martin watches over Redwall...', CANVAS_W / 2, CANVAS_H / 2 + 20);

        ctx.font = '16px Georgia, serif';
        ctx.fillStyle = '#F5DEB3';
        ctx.fillText('Press SPACE to return to the Abbey', CANVAS_W / 2, CANVAS_H / 2 + 60);
    }

    drawVictory() {
        const ctx = this.ctx;

        ctx.fillStyle = '#0a0a00';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Golden border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, CANVAS_W - 40, CANVAS_H - 40);

        const centerY = CANVAS_H / 2;
        const wobble = Math.sin(this.titleAnimTimer * 2) * 3;

        ctx.textAlign = 'center';

        ctx.font = 'bold 52px Georgia, serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('VICTORY!', CANVAS_W / 2, centerY - 120 + wobble);

        ctx.font = '24px Georgia, serif';
        ctx.fillStyle = '#F5DEB3';
        ctx.fillText('Cluny the Scourge has been defeated!', CANVAS_W / 2, centerY - 60);

        ctx.font = '18px Georgia, serif';
        ctx.fillStyle = '#CD853F';
        ctx.fillText('Redwall Abbey stands safe once more.', CANVAS_W / 2, centerY - 20);
        ctx.fillText('The creatures of Mossflower celebrate their freedom.', CANVAS_W / 2, centerY + 10);

        ctx.font = 'italic 16px Georgia, serif';
        ctx.fillStyle = '#DAA520';
        ctx.fillText('Matthias, the Warrior of Redwall, has proven worthy', CANVAS_W / 2, centerY + 60);
        ctx.fillText('of the legacy of Martin the Warrior.', CANVAS_W / 2, centerY + 84);

        ctx.font = 'bold italic 20px Georgia, serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('"I am that is."', CANVAS_W / 2, centerY + 130);

        ctx.font = '14px Georgia, serif';
        ctx.fillStyle = '#8B6914';
        ctx.fillText(`Final Level: ${this.player.level} | Time: ${Math.floor(this.gameTime / 60)}m ${Math.floor(this.gameTime % 60)}s`, CANVAS_W / 2, centerY + 180);

        ctx.font = '14px Georgia, serif';
        ctx.fillStyle = '#CD853F';
        ctx.fillText('Press SPACE to return to title', CANVAS_W / 2, CANVAS_H - 60);

        ctx.font = '12px Georgia, serif';
        ctx.fillStyle = '#5C3A1E';
        ctx.fillText('Based on "Redwall" by Brian Jacques', CANVAS_W / 2, CANVAS_H - 36);
    }
}

// ============ START THE GAME ============
window.addEventListener('load', () => {
    const game = new Game();
    game.init();

    // Start title music after first interaction
    const startMusic = () => {
        AudioSystem.resume();
        AudioSystem.music.playTitle();
        window.removeEventListener('click', startMusic);
        window.removeEventListener('keydown', startMusic);
    };
    window.addEventListener('click', startMusic);
    window.addEventListener('keydown', startMusic);
});
