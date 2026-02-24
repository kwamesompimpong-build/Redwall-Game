// ============================================================
// Redwall: The Warrior's Quest - Item System
// ============================================================

const ItemDB = {
    // Weapons
    starter_sword: {
        name: 'Wooden Sword',
        icon: '\u2694',
        type: 'weapon',
        description: 'A simple wooden practice sword. Better than nothing.',
        attack: 3,
        value: 5
    },
    iron_sword: {
        name: 'Iron Sword',
        icon: '\u2694',
        type: 'weapon',
        description: 'A sturdy iron blade forged by the otters.',
        attack: 7,
        value: 25
    },
    martin_sword: {
        name: "Sword of Martin",
        icon: '\u2694',
        type: 'weapon',
        description: 'The legendary sword of Martin the Warrior. Gleams with an inner light. The finest blade ever made.',
        attack: 15,
        value: 500
    },

    // Shields
    buckler_shield: {
        name: 'Buckler Shield',
        icon: '\uD83D\uDEE1',
        type: 'shield',
        description: 'A small round shield. Provides modest protection.',
        defense: 3,
        value: 15
    },
    abbey_shield: {
        name: 'Abbey Shield',
        icon: '\uD83D\uDEE1',
        type: 'shield',
        description: 'A shield bearing the crest of Redwall Abbey.',
        defense: 6,
        value: 40
    },

    // Consumables
    healing_herb: {
        name: 'Healing Herb',
        icon: '\uD83C\uDF3F',
        type: 'consumable',
        description: 'A medicinal herb from Mossflower Woods. Restores 15 HP.',
        heal: 15,
        value: 5
    },
    healing_ale: {
        name: 'October Ale',
        icon: '\uD83C\uDF7A',
        type: 'consumable',
        description: 'A fine brew from the Abbey cellars. Restores 25 HP.',
        heal: 25,
        value: 10
    },
    october_ale: {
        name: 'Vintage October Ale',
        icon: '\uD83C\uDF7A',
        type: 'consumable',
        description: 'The finest October Ale, aged for seasons. Restores 50 HP.',
        heal: 50,
        value: 30
    },
    fresh_fish: {
        name: 'Fresh Fish',
        icon: '\uD83D\uDC1F',
        type: 'consumable',
        description: 'A fresh catch from River Moss. Restores 20 HP.',
        heal: 20,
        value: 8
    },
    meadowcream: {
        name: 'Meadowcream',
        icon: '\uD83C\uDF75',
        type: 'consumable',
        description: 'A delicious Redwall treat. Restores 40 HP and cures ailments.',
        heal: 40,
        value: 20
    },

    // Quest items
    sparrow_feather: {
        name: 'Sparrow Feather',
        icon: '\uD83E\uDEB6',
        type: 'quest',
        description: "A feather gifted by Warbeak. Proves friendship with the Sparra tribe.",
        value: 0
    },
    rusty_key: {
        name: 'Rusty Key',
        icon: '\uD83D\uDD11',
        type: 'quest',
        description: 'An old key found in the tunnels. Opens something ancient.',
        value: 0
    },
    abbey_tapestry_piece: {
        name: 'Tapestry Fragment',
        icon: '\uD83E\uDDF5',
        type: 'quest',
        description: 'A piece of the Great Hall tapestry showing a clue to the sword of Martin.',
        value: 0
    },
    martin_shield: {
        name: "Martin's Shield",
        icon: '\uD83D\uDEE1',
        type: 'shield',
        description: 'The shield of Martin the Warrior. Bears the letter M.',
        defense: 10,
        value: 500
    }
};

class Inventory {
    constructor() {
        this.items = []; // Array of {itemId, count}
        this.maxSlots = 15;
        this.equipped = {
            weapon: 'starter_sword',
            shield: null
        };
    }

    addItem(itemId, count) {
        count = count || 1;
        const existing = this.items.find(i => i.itemId === itemId);
        if (existing) {
            existing.count += count;
            return true;
        }
        if (this.items.length < this.maxSlots) {
            this.items.push({ itemId, count });
            return true;
        }
        return false; // Full
    }

    removeItem(itemId, count) {
        count = count || 1;
        const idx = this.items.findIndex(i => i.itemId === itemId);
        if (idx === -1) return false;
        this.items[idx].count -= count;
        if (this.items[idx].count <= 0) {
            this.items.splice(idx, 1);
        }
        return true;
    }

    hasItem(itemId) {
        return this.items.some(i => i.itemId === itemId);
    }

    getCount(itemId) {
        const item = this.items.find(i => i.itemId === itemId);
        return item ? item.count : 0;
    }

    useItem(itemId, player) {
        const dbItem = ItemDB[itemId];
        if (!dbItem) return false;

        if (dbItem.type === 'consumable') {
            if (player.hp >= player.maxHp) return false; // Already full
            player.hp = Math.min(player.maxHp, player.hp + dbItem.heal);
            this.removeItem(itemId);
            return true;
        }
        if (dbItem.type === 'weapon') {
            // Unequip current and equip new
            const old = this.equipped.weapon;
            this.equipped.weapon = itemId;
            this.removeItem(itemId);
            if (old && old !== 'starter_sword') {
                this.addItem(old);
            }
            return true;
        }
        if (dbItem.type === 'shield') {
            const old = this.equipped.shield;
            this.equipped.shield = itemId;
            this.removeItem(itemId);
            if (old) {
                this.addItem(old);
            }
            return true;
        }
        return false;
    }

    getAttack() {
        const weapon = ItemDB[this.equipped.weapon];
        return weapon ? weapon.attack : 1;
    }

    getDefense() {
        const shield = this.equipped.shield ? ItemDB[this.equipped.shield] : null;
        return shield ? shield.defense : 0;
    }

    serialize() {
        return {
            items: this.items.slice(),
            equipped: { ...this.equipped }
        };
    }

    deserialize(data) {
        this.items = data.items || [];
        this.equipped = data.equipped || { weapon: 'starter_sword', shield: null };
    }
}

// Render the inventory UI
function renderInventoryUI(inventory) {
    const grid = document.getElementById('inv-grid');
    const desc = document.getElementById('item-desc');
    grid.innerHTML = '';

    // Show equipped items first
    const equippedSlot = (label, itemId) => {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.style.borderColor = '#DAA520';
        if (itemId && ItemDB[itemId]) {
            const item = ItemDB[itemId];
            slot.innerHTML = `<span>${item.icon}</span><span class="item-name">${label}</span>`;
            slot.addEventListener('click', () => {
                desc.textContent = `[Equipped] ${item.name}: ${item.description}`;
            });
        } else {
            slot.innerHTML = `<span>-</span><span class="item-name">${label}</span>`;
        }
        grid.appendChild(slot);
    };

    equippedSlot('Weapon', inventory.equipped.weapon);
    equippedSlot('Shield', inventory.equipped.shield);

    // Empty spacer
    const spacer = document.createElement('div');
    spacer.className = 'inv-slot';
    spacer.style.opacity = '0.3';
    spacer.innerHTML = '<span class="item-name">---</span>';
    grid.appendChild(spacer);
    grid.appendChild(spacer.cloneNode(true));
    grid.appendChild(spacer.cloneNode(true));

    // Inventory items
    for (const invItem of inventory.items) {
        const dbItem = ItemDB[invItem.itemId];
        if (!dbItem) continue;
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.innerHTML = `
            <span>${dbItem.icon}</span>
            <span class="item-name">${dbItem.name}</span>
            ${invItem.count > 1 ? `<span class="item-count">x${invItem.count}</span>` : ''}
        `;
        slot.addEventListener('click', () => {
            desc.textContent = `${dbItem.name}: ${dbItem.description}`;
            if (dbItem.type === 'consumable') {
                desc.textContent += ' [Click again to use]';
                slot.addEventListener('click', function useHandler() {
                    if (window.gameInstance) {
                        const used = inventory.useItem(invItem.itemId, window.gameInstance.player);
                        if (used) {
                            AudioSystem.sfx.heal();
                            renderInventoryUI(inventory);
                        }
                    }
                    slot.removeEventListener('click', useHandler);
                }, { once: true });
            } else if (dbItem.type === 'weapon' || dbItem.type === 'shield') {
                desc.textContent += ' [Click again to equip]';
                slot.addEventListener('click', function equipHandler() {
                    inventory.useItem(invItem.itemId, window.gameInstance.player);
                    AudioSystem.sfx.menuConfirm();
                    renderInventoryUI(inventory);
                    slot.removeEventListener('click', equipHandler);
                }, { once: true });
            }
        });
        grid.appendChild(slot);
    }

    // Fill remaining slots
    const remaining = 15 - 5 - inventory.items.length;
    for (let i = 0; i < remaining && i < 10; i++) {
        const slot = document.createElement('div');
        slot.className = 'inv-slot';
        slot.style.opacity = '0.3';
        grid.appendChild(slot);
    }
}
