// ============================================================
// Redwall: The Warrior's Quest - Map System
// ============================================================
// Tile types:
// 0  = grass           6  = flowers       12 = stairs
// 1  = stone floor     7  = tall grass    13 = hedge
// 2  = stone wall      8  = wood floor    14 = campfire
// 3  = abbey wall      9  = chest         15 = bridge
// 4  = tree            10 = bookshelf
// 5  = water           11 = table
// 99 = door (passable, map transition)

const TILE_SOLID = {
    2: true, 3: true, 4: true, 5: true, 10: true, 11: true, 13: true
};

const TILE_DRAW = {
    0: 'grass', 1: 'stoneFloor', 2: 'stoneWall', 3: 'abbeyWall',
    4: 'tree', 5: 'water', 6: 'flowers', 7: 'tallGrass',
    8: 'woodFloor', 9: 'chest', 10: 'bookshelf', 11: 'table',
    12: 'stairs', 13: 'hedge', 14: 'campfire', 15: 'bridge',
    99: 'door'
};

// Map transitions: { fromMap, toMap, fromTiles: [{x,y}], toX, toY }
const MapTransitions = [];

// ---- MAP DATA ----
// Each map is 30x20 tiles (960x640 pixels)

const Maps = {
    // ===== ABBEY GROUNDS (main hub) =====
    abbey_grounds: {
        name: 'Redwall Abbey Grounds',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            // Fill with grass
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 0;
                }
            }

            // Abbey walls (top)
            for (let x = 3; x < 27; x++) { t[1][x] = 3; t[2][x] = 3; }
            // Side walls
            for (let y = 1; y < 12; y++) { t[y][3] = 3; t[y][26] = 3; }
            // Inner wall bottom
            for (let x = 3; x < 12; x++) t[11][x] = 3;
            for (let x = 18; x < 27; x++) t[11][x] = 3;

            // Courtyard (stone floor inside walls)
            for (let y = 3; y < 11; y++) {
                for (let x = 4; x < 26; x++) {
                    t[y][x] = 1;
                }
            }

            // Abbey door (south entrance to Great Hall)
            t[11][14] = 99; t[11][15] = 99;

            // North door (to upper abbey)
            t[1][14] = 99; t[1][15] = 99;

            // Garden patches
            for (let x = 5; x < 9; x++) for (let y = 4; y < 6; y++) t[y][x] = 6;
            for (let x = 21; x < 25; x++) for (let y = 4; y < 6; y++) t[y][x] = 6;

            // Pond
            t[7][7] = 5; t[7][8] = 5; t[8][7] = 5; t[8][8] = 5;

            // Tables in courtyard
            t[6][14] = 11; t[6][15] = 11;
            t[8][14] = 11; t[8][15] = 11;

            // Path from south entrance
            for (let y = 12; y < 20; y++) { t[y][14] = 0; t[y][15] = 0; }

            // Gate at bottom
            for (let x = 3; x < 27; x++) t[18][x] = 13;
            t[18][14] = 0; t[18][15] = 0;

            // Hedges and trees around outside
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 20; y++) {
                    t[y][x] = (y % 3 === 0) ? 4 : 13;
                }
            }
            for (let x = 27; x < 30; x++) {
                for (let y = 0; y < 20; y++) {
                    t[y][x] = (y % 3 === 0) ? 4 : 13;
                }
            }

            // South path (exit to Mossflower)
            t[19][14] = 0; t[19][15] = 0;

            // NPCs
            this.npcs = [
                { id: 'abbot', name: 'Abbot Mortimer', type: 'mouse', robeColor: '#8B0000',
                  x: 15, y: 5, dialogue: 'abbot_greeting', quest: 'main_quest' },
                { id: 'constance', name: 'Constance the Badger', type: 'badger',
                  x: 22, y: 8, dialogue: 'constance_greeting' },
                { id: 'cornflower', name: 'Cornflower', type: 'mouse', robeColor: '#4682B4',
                  x: 6, y: 9, dialogue: 'cornflower_greeting' },
                { id: 'brother_alf', name: 'Brother Alf', type: 'mouse', robeColor: '#2E6B2E',
                  x: 10, y: 7, dialogue: 'brother_alf_greeting' }
            ];

            // Transitions
            this.transitions = [
                { tiles: [{x: 14, y: 11}, {x: 15, y: 11}], toMap: 'great_hall', toX: 14, toY: 1 },
                { tiles: [{x: 14, y: 19}, {x: 15, y: 19}], toMap: 'mossflower_south', toX: 14, toY: 1 },
                { tiles: [{x: 14, y: 1}, {x: 15, y: 1}], toMap: 'abbey_upper', toX: 14, toY: 18 }
            ];
        }
    },

    // ===== GREAT HALL =====
    great_hall: {
        name: 'Great Hall of Redwall',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    if (x < 2 || x > 27 || y < 0 || y > 19) t[y][x] = 3;
                    else t[y][x] = 1;
                }
            }
            // Walls
            for (let x = 0; x < 30; x++) { t[0][x] = 3; t[19][x] = 3; }
            for (let y = 0; y < 20; y++) { t[y][0] = 3; t[y][1] = 3; t[y][28] = 3; t[y][29] = 3; }

            // Exit north (to courtyard)
            t[0][14] = 99; t[0][15] = 99;

            // Tapestry wall (Martin the Warrior) - represented by bookshelf tiles
            for (let x = 8; x < 22; x++) t[19][x] = 10;

            // Long tables
            for (let x = 5; x < 13; x++) { t[6][x] = 11; t[10][x] = 11; t[14][x] = 11; }
            for (let x = 17; x < 25; x++) { t[6][x] = 11; t[10][x] = 11; t[14][x] = 11; }

            // Fireplace
            t[18][14] = 14; t[18][15] = 14;

            // Exit south (to Cavern Hole)
            t[19][14] = 99; t[19][15] = 99;

            // Chest
            t[17][4] = 9;

            this.npcs = [
                { id: 'methuselah', name: 'Brother Methuselah', type: 'mouse', robeColor: '#556B2F',
                  x: 14, y: 16, dialogue: 'methuselah_greeting', quest: 'find_sword' }
            ];

            this.items = [
                { id: 'healing_ale', x: 4, y: 17, itemId: 'healing_ale', respawn: false }
            ];

            this.transitions = [
                { tiles: [{x: 14, y: 0}, {x: 15, y: 0}], toMap: 'abbey_grounds', toX: 14, toY: 12 },
                { tiles: [{x: 14, y: 19}, {x: 15, y: 19}], toMap: 'cavern_hole', toX: 14, toY: 1 }
            ];
        }
    },

    // ===== CAVERN HOLE =====
    cavern_hole: {
        name: 'Cavern Hole',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 1;
                }
            }
            // Stone walls
            for (let x = 0; x < 30; x++) { t[0][x] = 2; t[19][x] = 2; }
            for (let y = 0; y < 20; y++) { t[y][0] = 2; t[y][1] = 2; t[y][28] = 2; t[y][29] = 2; }

            // North exit (to Great Hall)
            t[0][14] = 99; t[0][15] = 99;

            // Stairs down
            t[17][14] = 12; t[17][15] = 12;

            // Cozy room: bookshelves along walls
            for (let y = 3; y < 8; y++) { t[y][2] = 10; t[y][27] = 10; }
            // Fireplace
            t[18][6] = 14; t[18][7] = 14;
            // Tables
            t[10][10] = 11; t[10][11] = 11; t[10][18] = 11; t[10][19] = 11;

            this.npcs = [
                { id: 'foremole', name: 'Foremole', type: 'mouse', robeColor: '#3E2723',
                  x: 20, y: 10, dialogue: 'foremole_greeting' }
            ];

            this.items = [
                { id: 'shield_buckler', x: 27, y: 15, itemId: 'buckler_shield', respawn: false }
            ];

            this.transitions = [
                { tiles: [{x: 14, y: 0}, {x: 15, y: 0}], toMap: 'great_hall', toX: 14, toY: 18 },
                { tiles: [{x: 14, y: 17}, {x: 15, y: 17}], toMap: 'abbey_cellar', toX: 14, toY: 2 }
            ];
        }
    },

    // ===== ABBEY CELLAR =====
    abbey_cellar: {
        name: 'Abbey Cellars',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 1;
                }
            }
            for (let x = 0; x < 30; x++) { t[0][x] = 2; t[19][x] = 2; }
            for (let y = 0; y < 20; y++) { t[y][0] = 2; t[y][1] = 2; t[y][28] = 2; t[y][29] = 2; }

            // Stairs up
            t[1][14] = 12; t[1][15] = 12;

            // Barrels (use table sprites)
            for (let x = 3; x < 8; x++) { t[5][x] = 11; t[8][x] = 11; }
            for (let x = 22; x < 27; x++) { t[5][x] = 11; t[8][x] = 11; }

            // Secret passage hint
            t[19][24] = 99; // Hidden passage

            this.npcs = [
                { id: 'ambrose', name: 'Ambrose Spike', type: 'mouse', robeColor: '#8B6914',
                  x: 10, y: 6, dialogue: 'ambrose_greeting' }
            ];

            this.items = [
                { id: 'cellar_ale1', x: 5, y: 12, itemId: 'healing_ale', respawn: true },
                { id: 'cellar_ale2', x: 6, y: 14, itemId: 'october_ale', respawn: true }
            ];

            this.transitions = [
                { tiles: [{x: 14, y: 1}, {x: 15, y: 1}], toMap: 'cavern_hole', toX: 14, toY: 16 },
                { tiles: [{x: 24, y: 19}], toMap: 'abbey_tunnels', toX: 2, toY: 2 }
            ];
        }
    },

    // ===== ABBEY UPPER (Belltower / Attic) =====
    abbey_upper: {
        name: 'Abbey Belltower',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 8;
                }
            }
            for (let x = 0; x < 30; x++) { t[0][x] = 3; t[19][x] = 3; }
            for (let y = 0; y < 20; y++) { t[y][0] = 3; t[y][1] = 3; t[y][28] = 3; t[y][29] = 3; }

            t[19][14] = 12; t[19][15] = 12;

            // Bell platform
            for (let x = 10; x < 20; x++) for (let y = 6; y < 12; y++) t[y][x] = 1;
            for (let x = 10; x < 20; x++) { t[6][x] = 2; t[11][x] = 2; }
            for (let y = 6; y < 12; y++) { t[y][10] = 2; t[y][19] = 2; }
            t[11][14] = 1; t[11][15] = 1; // entrance

            // Sparrow territory (rooftops)
            this.npcs = [
                { id: 'warbeak', name: 'Warbeak Sparrow', type: 'sparrow',
                  x: 14, y: 8, dialogue: 'warbeak_greeting' }
            ];

            this.items = [
                { id: 'sparrow_feather', x: 16, y: 9, itemId: 'sparrow_feather', respawn: false }
            ];

            this.transitions = [
                { tiles: [{x: 14, y: 19}, {x: 15, y: 19}], toMap: 'abbey_grounds', toX: 14, toY: 2 }
            ];
        }
    },

    // ===== ABBEY TUNNELS =====
    abbey_tunnels: {
        name: 'Secret Tunnels',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 2; // All walls
                }
            }
            // Carve out tunnel paths
            const tunnelPath = [
                // Main corridor
                ...Array.from({length: 26}, (_, i) => ({x: 2 + i, y: 2})),
                ...Array.from({length: 26}, (_, i) => ({x: 2 + i, y: 3})),
                // South branch
                ...Array.from({length: 14}, (_, i) => ({x: 14, y: 3 + i})),
                ...Array.from({length: 14}, (_, i) => ({x: 15, y: 3 + i})),
                // East branch
                ...Array.from({length: 8}, (_, i) => ({x: 20, y: 3 + i})),
                ...Array.from({length: 8}, (_, i) => ({x: 21, y: 3 + i})),
                // West branch
                ...Array.from({length: 8}, (_, i) => ({x: 8, y: 3 + i})),
                ...Array.from({length: 8}, (_, i) => ({x: 9, y: 3 + i})),
                // Room at south
                ...Array.from({length: 6}, (_, i) => Array.from({length: 6}, (_, j) => ({x: 12 + j, y: 14 + i}))).flat()
            ];
            for (const p of tunnelPath) {
                if (p.y >= 0 && p.y < 20 && p.x >= 0 && p.x < 30) {
                    t[p.y][p.x] = 1;
                }
            }

            this.enemies = [
                { type: 'rat', x: 10, y: 3, patrol: true },
                { type: 'rat', x: 20, y: 7, patrol: true },
                { type: 'rat', x: 15, y: 12, patrol: true }
            ];

            this.items = [
                { id: 'tunnel_key', x: 14, y: 17, itemId: 'rusty_key', respawn: false }
            ];

            this.transitions = [
                { tiles: [{x: 2, y: 2}], toMap: 'abbey_cellar', toX: 24, toY: 18 },
                { tiles: [{x: 27, y: 2}], toMap: 'mossflower_south', toX: 2, toY: 10 }
            ];
        }
    },

    // ===== MOSSFLOWER SOUTH (main overworld) =====
    mossflower_south: {
        name: 'Mossflower Woods - South',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 7; // Tall grass (forest floor)
                }
            }
            // Dense trees
            const treePositions = [
                [0,0],[1,0],[2,0],[3,0],[0,1],[1,1],[0,2],[0,3],
                [27,0],[28,0],[29,0],[28,1],[29,1],[29,2],
                [0,5],[1,5],[0,6],[1,6],
                [28,4],[29,4],[29,5],
                [5,3],[6,3],[7,8],[3,12],[4,12],[25,7],[26,7],
                [0,14],[1,14],[0,15],[0,16],[0,17],[0,18],[0,19],
                [29,14],[29,15],[29,16],[29,17],[29,18],[29,19],
                [28,18],[28,19],[1,18],[1,19],
                [10,5],[22,5],[8,12],[24,12],
                [5,16],[6,17],[24,16],[25,17],
                [12,8],[18,8],[15,12],
            ];
            for (const [x, y] of treePositions) t[y][x] = 4;

            // Main path (north-south)
            for (let y = 0; y < 20; y++) { t[y][14] = 0; t[y][15] = 0; }

            // East-west path
            for (let x = 3; x < 27; x++) { t[10][x] = 0; }

            // River on east side
            for (let y = 12; y < 20; y++) { t[y][27] = 5; t[y][28] = 5; }
            // Bridge
            t[15][27] = 15; t[15][28] = 15;

            // Campfire clearing
            t[7][14] = 0; t[7][15] = 0; t[7][16] = 0;
            t[8][13] = 0; t[8][14] = 14; t[8][15] = 0; t[8][16] = 0;
            t[9][14] = 0; t[9][15] = 0;

            this.npcs = [
                { id: 'log_a_log', name: 'Log-a-Log', type: 'mouse', robeColor: '#556B2F',
                  x: 13, y: 7, dialogue: 'log_a_log_greeting' }
            ];

            this.enemies = [
                { type: 'rat', x: 6, y: 6, patrol: true },
                { type: 'weasel', x: 22, y: 8, patrol: true },
                { type: 'rat', x: 10, y: 14, patrol: true },
                { type: 'ferret', x: 20, y: 14, patrol: true }
            ];

            this.items = [
                { id: 'forest_herb', x: 9, y: 9, itemId: 'healing_herb', respawn: true }
            ];

            this.transitions = [
                { tiles: [{x: 14, y: 0}, {x: 15, y: 0}], toMap: 'abbey_grounds', toX: 14, toY: 18 },
                { tiles: [{x: 14, y: 19}, {x: 15, y: 19}], toMap: 'mossflower_deep', toX: 14, toY: 1 },
                { tiles: [{x: 0, y: 10}], toMap: 'quarry', toX: 28, toY: 10 },
                { tiles: [{x: 29, y: 10}], toMap: 'river_moss', toX: 1, toY: 10 }
            ];
        }
    },

    // ===== MOSSFLOWER DEEP (deeper woods) =====
    mossflower_deep: {
        name: 'Mossflower Woods - Deep',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 7;
                }
            }
            // Lots of trees - dense forest
            for (let y = 0; y < 20; y++) {
                for (let x = 0; x < 30; x++) {
                    if (Math.random() < 0.25) t[y][x] = 4;
                }
            }
            // Clear path
            for (let y = 0; y < 20; y++) {
                t[y][14] = 0; t[y][15] = 0;
                // Clear around path
                if (t[y][13] === 4) t[y][13] = 7;
                if (t[y][16] === 4) t[y][16] = 7;
            }
            // East-west clearing
            for (let x = 6; x < 24; x++) {
                t[10][x] = 0;
                if (t[9][x] === 4) t[9][x] = 7;
                if (t[11][x] === 4) t[11][x] = 7;
            }

            // Clearing for camp
            for (let y = 8; y < 13; y++) {
                for (let x = 8; x < 22; x++) {
                    t[y][x] = 0;
                }
            }

            this.enemies = [
                { type: 'rat', x: 8, y: 4, patrol: true },
                { type: 'rat', x: 20, y: 4, patrol: true },
                { type: 'weasel', x: 10, y: 15, patrol: true },
                { type: 'ferret', x: 18, y: 15, patrol: true },
                { type: 'weasel', x: 6, y: 10, patrol: true },
                { type: 'ferret', x: 22, y: 10, patrol: true }
            ];

            this.npcs = [
                { id: 'skipper', name: 'Skipper of Otters', type: 'otter',
                  x: 14, y: 10, dialogue: 'skipper_greeting', quest: 'otter_help' }
            ];

            this.items = [
                { id: 'deep_herb', x: 12, y: 9, itemId: 'healing_herb', respawn: true }
            ];

            this.transitions = [
                { tiles: [{x: 14, y: 0}, {x: 15, y: 0}], toMap: 'mossflower_south', toX: 14, toY: 18 },
                { tiles: [{x: 14, y: 19}, {x: 15, y: 19}], toMap: 'cluny_camp', toX: 14, toY: 1 }
            ];
        }
    },

    // ===== QUARRY =====
    quarry: {
        name: 'The Old Quarry',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 1; // Stone ground
                }
            }
            // Walls (quarry walls)
            for (let x = 0; x < 30; x++) { t[0][x] = 2; t[19][x] = 2; }
            for (let y = 0; y < 20; y++) { t[y][0] = 2; }
            // Open east side (forest)
            for (let y = 0; y < 20; y++) { t[y][29] = 4; }
            t[10][29] = 0; // exit east

            // Quarry features
            for (let x = 3; x < 10; x++) for (let y = 3; y < 6; y++) t[y][x] = 2;
            for (let x = 3; x < 10; x++) for (let y = 14; y < 17; y++) t[y][x] = 2;

            this.enemies = [
                { type: 'rat', x: 15, y: 5, patrol: true },
                { type: 'rat', x: 15, y: 14, patrol: true },
                { type: 'weasel', x: 22, y: 10, patrol: true }
            ];

            this.items = [
                { id: 'quarry_sword', x: 6, y: 10, itemId: 'iron_sword', respawn: false }
            ];

            this.transitions = [
                { tiles: [{x: 29, y: 10}], toMap: 'mossflower_south', toX: 1, toY: 10 }
            ];
        }
    },

    // ===== RIVER MOSS =====
    river_moss: {
        name: 'River Moss',
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 0;
                }
            }
            // River running north-south
            for (let y = 0; y < 20; y++) {
                for (let x = 12; x < 18; x++) t[y][x] = 5;
            }
            // Bridge
            for (let x = 12; x < 18; x++) t[10][x] = 15;

            // Trees on both banks
            for (let y = 0; y < 20; y++) {
                if (y % 3 === 0) { t[y][0] = 4; t[y][29] = 4; t[y][10] = 4; t[y][19] = 4; }
                if (y % 4 === 0) { t[y][1] = 4; t[y][28] = 4; }
            }

            // West exit
            t[10][0] = 0;

            this.npcs = [
                { id: 'squire_julian', name: 'Squire Julian Gingivere', type: 'mouse', robeColor: '#DAA520',
                  x: 5, y: 10, dialogue: 'julian_greeting' }
            ];

            this.enemies = [
                { type: 'rat', x: 22, y: 5, patrol: true },
                { type: 'ferret', x: 22, y: 15, patrol: true }
            ];

            this.items = [
                { id: 'river_fish', x: 8, y: 8, itemId: 'fresh_fish', respawn: true }
            ];

            this.transitions = [
                { tiles: [{x: 0, y: 10}], toMap: 'mossflower_south', toX: 28, toY: 10 }
            ];
        }
    },

    // ===== CLUNY'S CAMP (Final area) =====
    cluny_camp: {
        name: "Cluny's War Camp",
        tiles: [],
        npcs: [],
        enemies: [],
        items: [],
        transitions: [],
        init() {
            const t = this.tiles;
            for (let y = 0; y < 20; y++) {
                t[y] = [];
                for (let x = 0; x < 30; x++) {
                    t[y][x] = 0;
                }
            }
            // Dark ground
            for (let y = 0; y < 20; y++) {
                for (let x = 0; x < 30; x++) {
                    if (Math.random() < 0.15) t[y][x] = 7;
                }
            }

            // Perimeter trees
            for (let x = 0; x < 30; x++) { t[0][x] = 4; }
            for (let y = 0; y < 20; y++) { t[y][0] = 4; t[y][29] = 4; }

            // Entrance
            t[0][14] = 0; t[0][15] = 0;

            // Camp structures (tents = tables)
            for (let x = 4; x < 8; x++) { t[6][x] = 11; t[7][x] = 11; }
            for (let x = 22; x < 26; x++) { t[6][x] = 11; t[7][x] = 11; }

            // Campfires
            t[8][6] = 14; t[8][24] = 14;

            // Boss arena (cleared area)
            for (let y = 12; y < 19; y++) {
                for (let x = 8; x < 22; x++) {
                    t[y][x] = 1;
                }
            }
            // Arena walls
            for (let x = 8; x < 22; x++) { t[12][x] = 2; t[18][x] = 2; }
            for (let y = 12; y < 19; y++) { t[y][8] = 2; t[y][21] = 2; }
            // Arena entrance
            t[12][14] = 1; t[12][15] = 1;

            this.enemies = [
                { type: 'rat', x: 6, y: 3, patrol: true },
                { type: 'rat', x: 24, y: 3, patrol: true },
                { type: 'weasel', x: 10, y: 5, patrol: true },
                { type: 'ferret', x: 20, y: 5, patrol: true },
                { type: 'rat', x: 12, y: 9, patrol: true },
                { type: 'rat', x: 18, y: 9, patrol: true }
            ];

            // Boss
            this.npcs = [
                { id: 'cluny', name: 'Cluny the Scourge', type: 'cluny',
                  x: 14, y: 15, dialogue: 'cluny_encounter', isBoss: true }
            ];

            this.items = [
                { id: 'camp_potion', x: 5, y: 8, itemId: 'october_ale', respawn: false }
            ];

            this.transitions = [
                { tiles: [{x: 14, y: 0}, {x: 15, y: 0}], toMap: 'mossflower_deep', toX: 14, toY: 18 }
            ];
        }
    }
};

// Initialize all maps
function initMaps() {
    for (const key of Object.keys(Maps)) {
        Maps[key].init();
    }
}

// Get tile at position (in tile coords)
function getTile(map, tx, ty) {
    if (ty < 0 || ty >= 20 || tx < 0 || tx >= 30) return 2; // Treat out of bounds as wall
    return map.tiles[ty][tx];
}

// Check if tile is solid
function isTileSolid(map, tx, ty) {
    const tile = getTile(map, tx, ty);
    return !!TILE_SOLID[tile];
}

// Render a map
function renderMap(ctx, map, animFrame) {
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 30; x++) {
            const tile = map.tiles[y][x];
            const drawName = TILE_DRAW[tile];
            if (drawName && TileSprites[drawName]) {
                const spriteName = `tile_${drawName}_${x}_${y}`;
                SpriteRenderer.draw(ctx, spriteName, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                    (sctx, w, h) => TileSprites[drawName](sctx, w, h));
            } else {
                // Unknown tile - draw as grass
                const spriteName = `tile_grass_default`;
                SpriteRenderer.draw(ctx, spriteName, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE,
                    (sctx, w, h) => TileSprites.grass(sctx, w, h));
            }
        }
    }
}
