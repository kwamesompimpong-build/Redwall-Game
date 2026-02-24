// ============================================================
// Redwall: The Warrior's Quest - Pixel Art Sprite System
// ============================================================

const SpriteRenderer = {
    // Pre-rendered sprite canvases cache
    cache: {},

    // Get or create a cached sprite
    getSprite(name, width, height, drawFn) {
        const key = `${name}_${width}_${height}`;
        if (!this.cache[key]) {
            const c = document.createElement('canvas');
            c.width = width;
            c.height = height;
            const ctx = c.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            drawFn(ctx, width, height);
            this.cache[key] = c;
        }
        return this.cache[key];
    },

    // Draw a sprite onto the game canvas
    draw(gameCtx, name, x, y, width, height, drawFn) {
        const sprite = this.getSprite(name, width, height, drawFn);
        gameCtx.drawImage(sprite, Math.floor(x), Math.floor(y));
    }
};

// ---- TILE SPRITES ----

const TileSprites = {
    // Grass tile
    grass(ctx, w, h) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, w, h);
        // Grass detail
        ctx.fillStyle = '#5a8c4f';
        for (let i = 0; i < 6; i++) {
            const gx = randInt(2, w - 4);
            const gy = randInt(2, h - 4);
            ctx.fillRect(gx, gy, 2, 2);
        }
        ctx.fillStyle = '#3a6c2f';
        for (let i = 0; i < 3; i++) {
            const gx = randInt(2, w - 4);
            const gy = randInt(2, h - 4);
            ctx.fillRect(gx, gy, 1, 3);
        }
    },

    // Stone floor (abbey interior)
    stoneFloor(ctx, w, h) {
        ctx.fillStyle = '#8a8278';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#7a7268';
        ctx.fillRect(0, 0, w / 2, h / 2);
        ctx.fillRect(w / 2, h / 2, w / 2, h / 2);
        ctx.strokeStyle = '#6a6258';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    },

    // Stone wall
    stoneWall(ctx, w, h) {
        ctx.fillStyle = '#6b6157';
        ctx.fillRect(0, 0, w, h);
        // Brick pattern
        ctx.fillStyle = '#7b7167';
        ctx.fillRect(2, 2, 12, 6);
        ctx.fillRect(18, 2, 12, 6);
        ctx.fillRect(8, 10, 12, 6);
        ctx.fillRect(24, 10, 6, 6);
        ctx.fillRect(0, 10, 4, 6);
        ctx.fillRect(2, 18, 12, 6);
        ctx.fillRect(18, 18, 12, 6);
        ctx.fillRect(2, 26, 12, 6);
        ctx.fillRect(18, 26, 12, 6);
        // Mortar lines
        ctx.strokeStyle = '#5b5147';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 8); ctx.lineTo(w, 8);
        ctx.moveTo(0, 16); ctx.lineTo(w, 16);
        ctx.moveTo(0, 24); ctx.lineTo(w, 24);
        ctx.moveTo(16, 0); ctx.lineTo(16, 8);
        ctx.moveTo(8, 8); ctx.lineTo(8, 16);
        ctx.moveTo(24, 8); ctx.lineTo(24, 16);
        ctx.moveTo(16, 16); ctx.lineTo(16, 24);
        ctx.moveTo(16, 24); ctx.lineTo(16, 32);
        ctx.stroke();
    },

    // Abbey red sandstone wall
    abbeyWall(ctx, w, h) {
        ctx.fillStyle = '#9B4A3A';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#A85A4A';
        ctx.fillRect(2, 2, 12, 6);
        ctx.fillRect(18, 2, 12, 6);
        ctx.fillRect(8, 10, 12, 6);
        ctx.fillRect(2, 18, 12, 6);
        ctx.fillRect(18, 18, 12, 6);
        ctx.fillRect(2, 26, 12, 6);
        ctx.fillRect(18, 26, 12, 6);
        ctx.strokeStyle = '#7B3A2A';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 8); ctx.lineTo(w, 8);
        ctx.moveTo(0, 16); ctx.lineTo(w, 16);
        ctx.moveTo(0, 24); ctx.lineTo(w, 24);
        ctx.moveTo(16, 0); ctx.lineTo(16, 8);
        ctx.moveTo(8, 8); ctx.lineTo(8, 16);
        ctx.moveTo(24, 8); ctx.lineTo(24, 16);
        ctx.moveTo(16, 16); ctx.lineTo(16, 24);
        ctx.stroke();
    },

    // Tree (dense forest)
    tree(ctx, w, h) {
        // Base grass
        ctx.fillStyle = '#3a6c2f';
        ctx.fillRect(0, 0, w, h);
        // Trunk
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(12, 18, 8, 14);
        // Canopy
        ctx.fillStyle = '#2D5A1E';
        ctx.fillRect(4, 2, 24, 12);
        ctx.fillRect(6, 0, 20, 4);
        ctx.fillRect(2, 6, 28, 8);
        ctx.fillRect(8, 14, 16, 6);
        // Canopy highlights
        ctx.fillStyle = '#3D6A2E';
        ctx.fillRect(8, 4, 6, 4);
        ctx.fillRect(18, 6, 4, 3);
        ctx.fillRect(10, 14, 4, 3);
    },

    // Water
    water(ctx, w, h) {
        ctx.fillStyle = '#2859A0';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#3069B0';
        ctx.fillRect(4, 6, 10, 2);
        ctx.fillRect(18, 14, 8, 2);
        ctx.fillRect(8, 22, 12, 2);
        ctx.fillStyle = '#4A89D0';
        ctx.fillRect(6, 8, 6, 1);
        ctx.fillRect(20, 16, 4, 1);
    },

    // Path / dirt road
    path(ctx, w, h) {
        ctx.fillStyle = '#9B8B6B';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#8B7B5B';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(randInt(2, w - 6), randInt(2, h - 6), 3, 3);
        }
        ctx.fillStyle = '#AB9B7B';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(randInt(2, w - 4), randInt(2, h - 4), 2, 2);
        }
    },

    // Door
    door(ctx, w, h) {
        ctx.fillStyle = '#9B8B6B';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(4, 2, 24, 28);
        ctx.fillStyle = '#7B5236';
        ctx.fillRect(6, 4, 9, 12);
        ctx.fillRect(17, 4, 9, 12);
        ctx.fillRect(6, 18, 20, 10);
        // Handle
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(22, 16, 3, 3);
        // Frame
        ctx.strokeStyle = '#5B3216';
        ctx.lineWidth = 1;
        ctx.strokeRect(4, 2, 24, 28);
    },

    // Flowers / garden
    flowers(ctx, w, h) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, w, h);
        // Flower stems
        ctx.fillStyle = '#2a5c1f';
        ctx.fillRect(8, 12, 1, 8);
        ctx.fillRect(20, 8, 1, 10);
        ctx.fillRect(14, 14, 1, 6);
        // Flowers
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6EC7'];
        ctx.fillStyle = colors[0];
        ctx.fillRect(6, 8, 5, 5);
        ctx.fillStyle = colors[1];
        ctx.fillRect(18, 4, 5, 5);
        ctx.fillStyle = colors[4];
        ctx.fillRect(12, 10, 5, 5);
    },

    // Tall grass (Mossflower underbrush)
    tallGrass(ctx, w, h) {
        ctx.fillStyle = '#3a6c2f';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#4a8c3f';
        for (let i = 0; i < 8; i++) {
            const gx = randInt(1, w - 3);
            ctx.fillRect(gx, randInt(0, 4), 2, randInt(12, 24));
        }
        ctx.fillStyle = '#5a9c4f';
        for (let i = 0; i < 4; i++) {
            const gx = randInt(1, w - 2);
            ctx.fillRect(gx, randInt(0, 6), 1, randInt(8, 16));
        }
    },

    // Wooden floor
    woodFloor(ctx, w, h) {
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#9B7924';
        ctx.fillRect(0, 0, w, h / 4);
        ctx.fillRect(0, h / 2, w, h / 4);
        ctx.strokeStyle = '#7B5904';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.25); ctx.lineTo(w, h * 0.25);
        ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5);
        ctx.moveTo(0, h * 0.75); ctx.lineTo(w, h * 0.75);
        ctx.stroke();
    },

    // Chest
    chest(ctx, w, h) {
        // Floor beneath
        ctx.fillStyle = '#8a8278';
        ctx.fillRect(0, 0, w, h);
        // Chest body
        ctx.fillStyle = '#8B5E3C';
        ctx.fillRect(6, 10, 20, 16);
        // Lid
        ctx.fillStyle = '#A0704C';
        ctx.fillRect(6, 6, 20, 8);
        // Metal bands
        ctx.fillStyle = '#B8860B';
        ctx.fillRect(6, 8, 20, 2);
        ctx.fillRect(6, 18, 20, 2);
        // Lock
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(14, 14, 4, 4);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(15, 15, 2, 2);
    },

    // Bookshelf
    bookshelf(ctx, w, h) {
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(0, 0, w, h);
        // Shelves
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(0, 10, w, 2);
        ctx.fillRect(0, 22, w, 2);
        // Books
        const bookColors = ['#8B0000', '#00008B', '#006400', '#4B0082', '#8B4513', '#191970'];
        for (let shelf = 0; shelf < 3; shelf++) {
            const baseY = shelf * 12;
            let bx = 2;
            for (let b = 0; b < 5; b++) {
                ctx.fillStyle = bookColors[(shelf * 5 + b) % bookColors.length];
                const bw = randInt(3, 5);
                ctx.fillRect(bx, baseY + 2, bw, 8);
                bx += bw + 1;
            }
        }
    },

    // Table
    table(ctx, w, h) {
        // Floor
        ctx.fillStyle = '#8a8278';
        ctx.fillRect(0, 0, w, h);
        // Table top
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(2, 8, 28, 16);
        ctx.fillStyle = '#9B7924';
        ctx.fillRect(4, 10, 24, 12);
        // Legs
        ctx.fillStyle = '#6B4914';
        ctx.fillRect(4, 24, 3, 6);
        ctx.fillRect(25, 24, 3, 6);
    },

    // Campfire
    campfire(ctx, w, h) {
        ctx.fillStyle = '#3a6c2f';
        ctx.fillRect(0, 0, w, h);
        // Logs
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(8, 20, 16, 4);
        ctx.fillRect(10, 18, 4, 8);
        ctx.fillRect(18, 18, 4, 8);
        // Fire
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(12, 10, 8, 10);
        ctx.fillStyle = '#FF6600';
        ctx.fillRect(13, 8, 6, 8);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(14, 6, 4, 8);
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(15, 8, 2, 4);
    },

    // Bridge
    bridge(ctx, w, h) {
        ctx.fillStyle = '#2859A0';
        ctx.fillRect(0, 0, w, h);
        // Planks
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(4, 0, 24, h);
        ctx.strokeStyle = '#6B4914';
        ctx.lineWidth = 1;
        for (let y = 2; y < h; y += 6) {
            ctx.beginPath();
            ctx.moveTo(4, y);
            ctx.lineTo(28, y);
            ctx.stroke();
        }
        // Rails
        ctx.fillStyle = '#6B4914';
        ctx.fillRect(4, 0, 2, h);
        ctx.fillRect(26, 0, 2, h);
    },

    // Stairs (map transition)
    stairs(ctx, w, h) {
        ctx.fillStyle = '#8a8278';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#7a7268';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(4 + i * 2, 4 + i * 5, w - 8 - i * 4, 5);
        }
        ctx.fillStyle = '#6a6258';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(4 + i * 2, 4 + i * 5, w - 8 - i * 4, 1);
        }
    },

    // Hedge / bush
    hedge(ctx, w, h) {
        ctx.fillStyle = '#3a6c2f';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#1E4D0F';
        ctx.fillRect(2, 2, 28, 28);
        ctx.fillStyle = '#2D5A1E';
        ctx.fillRect(4, 4, 24, 24);
        ctx.fillStyle = '#3D6A2E';
        ctx.fillRect(8, 6, 8, 6);
        ctx.fillRect(16, 12, 6, 8);
    }
};

// ---- CHARACTER SPRITES ----

const CharSprites = {
    // Matthias - young mouse warrior (the player)
    matthias(ctx, w, h, dir, frame) {
        // Body
        ctx.fillStyle = '#C4956A'; // Light brown fur
        // Body shape based on direction
        ctx.fillRect(10, 10, 12, 14);

        // Robe (green novice robe / later warrior garb)
        ctx.fillStyle = '#2E6B2E';
        ctx.fillRect(8, 14, 16, 12);

        // Head
        ctx.fillStyle = '#C4956A';
        ctx.fillRect(10, 4, 12, 10);

        // Ears
        ctx.fillStyle = '#D4A57A';
        ctx.fillRect(8, 2, 4, 5);
        ctx.fillRect(20, 2, 4, 5);

        // Eyes based on direction
        ctx.fillStyle = '#000';
        if (dir === DIR.DOWN || dir === undefined) {
            ctx.fillRect(12, 8, 2, 2);
            ctx.fillRect(18, 8, 2, 2);
        } else if (dir === DIR.UP) {
            // Eyes hidden facing away
        } else if (dir === DIR.LEFT) {
            ctx.fillRect(10, 8, 2, 2);
        } else if (dir === DIR.RIGHT) {
            ctx.fillRect(20, 8, 2, 2);
        }

        // Nose
        if (dir !== DIR.UP) {
            ctx.fillStyle = '#FF9999';
            ctx.fillRect(15, 10, 2, 2);
        }

        // Sword (on right side)
        ctx.fillStyle = '#A0A0A0';
        if (dir === DIR.RIGHT) {
            ctx.fillRect(26, 10, 2, 14);
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(25, 14, 4, 3);
        } else if (dir === DIR.LEFT) {
            ctx.fillRect(4, 10, 2, 14);
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(3, 14, 4, 3);
        } else {
            ctx.fillRect(24, 12, 2, 12);
            ctx.fillStyle = '#DAA520';
            ctx.fillRect(23, 14, 4, 3);
        }

        // Walking animation - feet
        ctx.fillStyle = '#8B6914';
        if (frame % 2 === 0) {
            ctx.fillRect(10, 26, 4, 4);
            ctx.fillRect(18, 26, 4, 4);
        } else {
            ctx.fillRect(12, 26, 4, 4);
            ctx.fillRect(16, 26, 4, 4);
        }
    },

    // Generic mouse NPC
    mouse(ctx, w, h, dir, frame, robeColor) {
        robeColor = robeColor || '#8B4513';
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(10, 10, 12, 14);
        ctx.fillStyle = robeColor;
        ctx.fillRect(8, 14, 16, 12);
        ctx.fillStyle = '#B8956A';
        ctx.fillRect(10, 4, 12, 10);
        ctx.fillStyle = '#C8A57A';
        ctx.fillRect(8, 2, 4, 5);
        ctx.fillRect(20, 2, 4, 5);
        ctx.fillStyle = '#000';
        if (dir === DIR.DOWN || dir === undefined) {
            ctx.fillRect(12, 8, 2, 2);
            ctx.fillRect(18, 8, 2, 2);
        }
        ctx.fillStyle = '#FF9999';
        ctx.fillRect(15, 10, 2, 2);
        ctx.fillStyle = '#654321';
        ctx.fillRect(10, 26, 4, 4);
        ctx.fillRect(18, 26, 4, 4);
    },

    // Badger (Constance)
    badger(ctx, w, h, dir, frame) {
        // Large body
        ctx.fillStyle = '#333';
        ctx.fillRect(6, 8, 20, 18);
        // White stripe
        ctx.fillStyle = '#EEE';
        ctx.fillRect(12, 2, 8, 24);
        // Head
        ctx.fillStyle = '#333';
        ctx.fillRect(8, 2, 16, 12);
        // White face stripe
        ctx.fillStyle = '#EEE';
        ctx.fillRect(13, 2, 6, 10);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(11, 6, 2, 2);
        ctx.fillRect(19, 6, 2, 2);
        // Nose
        ctx.fillStyle = '#333';
        ctx.fillRect(14, 9, 4, 3);
        // Apron
        ctx.fillStyle = '#FFF8DC';
        ctx.fillRect(10, 16, 12, 10);
        // Feet
        ctx.fillStyle = '#222';
        ctx.fillRect(8, 26, 6, 4);
        ctx.fillRect(18, 26, 6, 4);
    },

    // Rat enemy (Cluny's horde)
    rat(ctx, w, h, dir, frame) {
        // Body - dark grey
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(10, 10, 12, 14);
        // Armor
        ctx.fillStyle = '#5C3A1E';
        ctx.fillRect(8, 12, 16, 10);
        // Metal bits
        ctx.fillStyle = '#696969';
        ctx.fillRect(10, 12, 12, 2);
        // Head
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(10, 3, 12, 10);
        // Pointy ears
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(8, 1, 4, 4);
        ctx.fillRect(20, 1, 4, 4);
        // Red eyes
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(12, 6, 2, 2);
        ctx.fillRect(18, 6, 2, 2);
        // Snout
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(13, 9, 6, 4);
        ctx.fillStyle = '#FF6666';
        ctx.fillRect(15, 10, 2, 2);
        // Tail
        ctx.fillStyle = '#5A5A5A';
        ctx.fillRect(4, 22, 6, 2);
        ctx.fillRect(2, 20, 4, 2);
        // Weapon
        ctx.fillStyle = '#696969';
        ctx.fillRect(26, 8, 2, 16);
        // Feet
        ctx.fillStyle = '#3A3A3A';
        ctx.fillRect(10, 24, 4, 4);
        ctx.fillRect(18, 24, 4, 4);
    },

    // Cluny the Scourge (boss)
    cluny(ctx, w, h, dir, frame) {
        // Large body
        ctx.fillStyle = '#3A3A3A';
        ctx.fillRect(6, 8, 20, 18);
        // Cape
        ctx.fillStyle = '#4A0000';
        ctx.fillRect(4, 10, 24, 16);
        // Armor
        ctx.fillStyle = '#555';
        ctx.fillRect(8, 10, 16, 14);
        ctx.fillStyle = '#777';
        ctx.fillRect(10, 12, 12, 2);
        ctx.fillRect(10, 18, 12, 2);
        // Head (larger)
        ctx.fillStyle = '#3A3A3A';
        ctx.fillRect(8, 0, 16, 12);
        // Horned helmet
        ctx.fillStyle = '#555';
        ctx.fillRect(8, 0, 16, 4);
        ctx.fillStyle = '#777';
        ctx.fillRect(6, -2, 4, 6);
        ctx.fillRect(22, -2, 4, 6);
        // Eye - single burning eye
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(12, 5, 3, 3);
        ctx.fillRect(18, 5, 3, 3);
        ctx.fillStyle = '#FF4400';
        ctx.fillRect(13, 6, 1, 1);
        ctx.fillRect(19, 6, 1, 1);
        // Poisoned tail (his signature weapon)
        ctx.fillStyle = '#3A3A3A';
        ctx.fillRect(0, 24, 6, 2);
        ctx.fillRect(-2, 22, 4, 2);
        ctx.fillStyle = '#556B2F';
        ctx.fillRect(-4, 20, 4, 4);
        // Feet
        ctx.fillStyle = '#2A2A2A';
        ctx.fillRect(8, 26, 6, 4);
        ctx.fillRect(18, 26, 6, 4);
    },

    // Weasel enemy
    weasel(ctx, w, h, dir, frame) {
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(10, 10, 12, 14);
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(8, 14, 16, 10);
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(10, 3, 12, 12);
        ctx.fillStyle = '#9B8365';
        ctx.fillRect(8, 1, 4, 4);
        ctx.fillRect(20, 1, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 7, 2, 2);
        ctx.fillRect(18, 7, 2, 2);
        ctx.fillStyle = '#333';
        ctx.fillRect(13, 10, 6, 3);
        ctx.fillStyle = '#696969';
        ctx.fillRect(24, 10, 3, 12);
        ctx.fillRect(23, 8, 5, 3);
        ctx.fillStyle = '#6B5345';
        ctx.fillRect(10, 24, 4, 4);
        ctx.fillRect(18, 24, 4, 4);
    },

    // Ferret enemy
    ferret(ctx, w, h, dir, frame) {
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(10, 10, 12, 14);
        ctx.fillStyle = '#4A0000';
        ctx.fillRect(8, 14, 16, 10);
        ctx.fillStyle = '#D2B48C';
        ctx.fillRect(10, 3, 12, 12);
        // Dark mask around eyes
        ctx.fillStyle = '#3A2A1A';
        ctx.fillRect(10, 5, 12, 5);
        ctx.fillStyle = '#FF4444';
        ctx.fillRect(12, 6, 2, 2);
        ctx.fillRect(18, 6, 2, 2);
        ctx.fillStyle = '#B29478';
        ctx.fillRect(8, 1, 4, 4);
        ctx.fillRect(20, 1, 4, 4);
        ctx.fillStyle = '#696969';
        ctx.fillRect(26, 10, 2, 14);
        ctx.fillStyle = '#B2947C';
        ctx.fillRect(10, 24, 4, 4);
        ctx.fillRect(18, 24, 4, 4);
    },

    // Sparrow (Warbeak)
    sparrow(ctx, w, h) {
        ctx.fillStyle = '#6B5B4B';
        ctx.fillRect(10, 12, 12, 10);
        // Wings
        ctx.fillStyle = '#5B4B3B';
        ctx.fillRect(4, 14, 8, 8);
        ctx.fillRect(20, 14, 8, 8);
        // Head
        ctx.fillStyle = '#6B5B4B';
        ctx.fillRect(11, 4, 10, 10);
        // Cap
        ctx.fillStyle = '#4B3B2B';
        ctx.fillRect(11, 2, 10, 4);
        // Eye
        ctx.fillStyle = '#000';
        ctx.fillRect(17, 7, 2, 2);
        // Beak
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(21, 9, 5, 3);
        // Tail
        ctx.fillStyle = '#5B4B3B';
        ctx.fillRect(6, 20, 8, 6);
        // Feet
        ctx.fillStyle = '#DAA520';
        ctx.fillRect(12, 22, 2, 6);
        ctx.fillRect(18, 22, 2, 6);
    },

    // Otter (Skipper)
    otter(ctx, w, h) {
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(8, 8, 16, 18);
        // Head
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(10, 2, 12, 10);
        // Lighter belly
        ctx.fillStyle = '#C4956A';
        ctx.fillRect(12, 14, 8, 10);
        // Ears
        ctx.fillStyle = '#5B3216';
        ctx.fillRect(8, 2, 4, 3);
        ctx.fillRect(20, 2, 4, 3);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 6, 2, 2);
        ctx.fillRect(18, 6, 2, 2);
        // Whiskers
        ctx.fillStyle = '#888';
        ctx.fillRect(8, 9, 4, 1);
        ctx.fillRect(20, 9, 4, 1);
        // Javelin
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(26, 2, 2, 24);
        ctx.fillStyle = '#A0A0A0';
        ctx.fillRect(25, 0, 4, 4);
        // Feet
        ctx.fillStyle = '#5B3216';
        ctx.fillRect(10, 26, 4, 4);
        ctx.fillRect(18, 26, 4, 4);
    },

    // Item pickup sparkle
    itemPickup(ctx, w, h, frame) {
        ctx.fillStyle = '#FFD700';
        const s = 4 + Math.sin(frame * 0.3) * 2;
        ctx.fillRect(w / 2 - s / 2, h / 2 - s / 2, s, s);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(w / 2 - 1, h / 2 - s, 2, s * 2);
        ctx.fillRect(w / 2 - s, h / 2 - 1, s * 2, 2);
    }
};

// Draw HUD bars and elements
const HUD = {
    drawBar(ctx, x, y, w, h, value, maxValue, fillColor, bgColor) {
        ctx.fillStyle = bgColor || '#333';
        ctx.fillRect(x, y, w, h);
        const fillW = Math.max(0, (value / maxValue) * (w - 2));
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + 1, y + 1, fillW, h - 2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
    },

    drawText(ctx, text, x, y, size, color, align) {
        ctx.fillStyle = color || '#FFF';
        ctx.font = `${size || 14}px Georgia, serif`;
        ctx.textAlign = align || 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(text, x, y);
    },

    drawTextWithShadow(ctx, text, x, y, size, color, align) {
        ctx.font = `${size || 14}px Georgia, serif`;
        ctx.textAlign = align || 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000';
        ctx.fillText(text, x + 1, y + 1);
        ctx.fillStyle = color || '#FFF';
        ctx.fillText(text, x, y);
    }
};
