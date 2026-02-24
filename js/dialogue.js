// ============================================================
// Redwall: The Warrior's Quest - Dialogue System
// ============================================================

const DialogueDB = {
    // ---- ABBEY NPCs ----
    abbot_greeting: {
        lines: [
            { speaker: 'Abbot Mortimer', text: "Welcome, young Matthias. These are troubling times for our Abbey." },
            { speaker: 'Abbot Mortimer', text: "Word has come that Cluny the Scourge marches upon Redwall with his vermin horde." },
            { speaker: 'Abbot Mortimer', text: "You remind me of Martin the Warrior himself. Perhaps it is your destiny to defend us." },
            { speaker: 'Abbot Mortimer', text: "Seek out Brother Methuselah in the Great Hall. He knows of the legendary sword of Martin." },
            { speaker: 'Matthias', text: "I will not let Redwall fall, Father Abbot. I swear it on my life!" }
        ],
        onComplete: 'start_main_quest'
    },

    abbot_after_quest: {
        lines: [
            { speaker: 'Abbot Mortimer', text: "The Abbey depends on you, Matthias. Stay strong, and remember our motto:" },
            { speaker: 'Abbot Mortimer', text: '"Who says that I am dead / Knows nought at all / I am that is / Two mice within Redwall."' }
        ]
    },

    constance_greeting: {
        lines: [
            { speaker: 'Constance', text: "Hrrmph. About time a young creature showed some backbone around here." },
            { speaker: 'Constance', text: "I've been fortifying the walls, but we need more than stones to stop Cluny." },
            { speaker: 'Constance', text: "Take this advice: always watch your flanks in the woods. Vermin love ambushes." },
            { speaker: 'Constance', text: "If you find any useful supplies out there, bring them back. Every bit helps." }
        ]
    },

    cornflower_greeting: {
        lines: [
            { speaker: 'Cornflower', text: "Oh, Matthias! Please be careful out there." },
            { speaker: 'Cornflower', text: "I've been tending the garden. Here, take some healing herbs for your journey." },
            { speaker: 'Matthias', text: "Thank you, Cornflower. I'll come back safely, I promise." }
        ],
        giveItem: { itemId: 'healing_herb', count: 2 }
    },

    brother_alf_greeting: {
        lines: [
            { speaker: 'Brother Alf', text: "Matthias, my young friend! I've been tending to our stores." },
            { speaker: 'Brother Alf', text: "The pond here is a good place for quiet reflection. Try pressing I to check your inventory." },
            { speaker: 'Brother Alf', text: "And Q will show your quest journal. Essential tools for any warrior!" }
        ]
    },

    // ---- GREAT HALL ----
    methuselah_greeting: {
        lines: [
            { speaker: 'Brother Methuselah', text: "Ah, young Matthias. I have studied the tapestry of Martin the Warrior for many seasons." },
            { speaker: 'Brother Methuselah', text: "The great sword of Martin is hidden somewhere within this Abbey - or beneath it." },
            { speaker: 'Brother Methuselah', text: "I believe the old rhyme holds a clue: 'I - am that is, look to the place where the climbing wall flower grows.'" },
            { speaker: 'Brother Methuselah', text: "Search the Abbey from top to bottom. The belltower... the cellars... the hidden tunnels..." },
            { speaker: 'Brother Methuselah', text: "Find the sword, Matthias. Only with Martin's blade can Cluny be defeated." },
            { speaker: 'Matthias', text: "I will find it, Brother Methuselah. For Redwall!" }
        ],
        onComplete: 'start_sword_quest'
    },

    methuselah_after_quest: {
        lines: [
            { speaker: 'Brother Methuselah', text: "Search everywhere, Matthias. The sword could be in the most unexpected place." },
            { speaker: 'Brother Methuselah', text: "The belltower, the cellars, the tunnels beneath the Abbey..." }
        ]
    },

    // ---- CAVERN HOLE ----
    foremole_greeting: {
        lines: [
            { speaker: 'Foremole', text: "Burr aye, young Matthias! Us moles be diggen tunnels beneath the Abbey." },
            { speaker: 'Foremole', text: "Oi found some strange passages down in ee cellars. Might want to take ee look." },
            { speaker: 'Foremole', text: "Watch out though - we've heard scratchings down there. Might be vermin!" }
        ]
    },

    // ---- CELLAR ----
    ambrose_greeting: {
        lines: [
            { speaker: 'Ambrose Spike', text: "Keep your paws off my October Ale, young mouse!" },
            { speaker: 'Ambrose Spike', text: "Well... I suppose for the defender of the Abbey, I can spare a drop." },
            { speaker: 'Ambrose Spike', text: "There's something odd about the south wall down here. It echoes strangely..." }
        ],
        giveItem: { itemId: 'healing_ale', count: 1 }
    },

    // ---- BELLTOWER ----
    warbeak_greeting: {
        lines: [
            { speaker: 'Warbeak', text: "Sparras not like earthcrawlers usually. But mouse is brave, yes?" },
            { speaker: 'Warbeak', text: "Warbeak see many ratvermin from up high. They camp south in deep woods." },
            { speaker: 'Warbeak', text: "Take Sparra feather. Show to otherbeasts - they know you friend of Sparra." },
            { speaker: 'Matthias', text: "Thank you, Warbeak. The Sparra are true friends of Redwall!" }
        ],
        giveItem: { itemId: 'sparrow_feather', count: 1 }
    },

    // ---- MOSSFLOWER WOODS ----
    log_a_log_greeting: {
        lines: [
            { speaker: 'Log-a-Log', text: "Ho there, mouse! I am Log-a-Log, chieftain of the Guosim shrews." },
            { speaker: 'Log-a-Log', text: "We've been fighting Cluny's scouts in these woods for days." },
            { speaker: 'Log-a-Log', text: "The vermin are thick in the deep woods to the south. Be on your guard!" },
            { speaker: 'Log-a-Log', text: "If you're heading to the quarry to the west, watch for ambushes on the path." }
        ]
    },

    skipper_greeting: {
        lines: [
            { speaker: 'Skipper', text: "Ahoy, Matthias! Skipper of Otters at your service, matey!" },
            { speaker: 'Skipper', text: "My crew and I have been tracking Cluny's main force." },
            { speaker: 'Skipper', text: "His camp is just to the south. The blighter's got a whole army of vermin." },
            { speaker: 'Skipper', text: "You'll need Martin's sword to face him. Have you found it yet?" },
            { speaker: 'Skipper', text: "If you help us clear out some of these vermin, we'll fight by your side when the time comes." }
        ],
        onComplete: 'start_otter_quest'
    },

    julian_greeting: {
        lines: [
            { speaker: 'Squire Julian', text: "Ah, a traveler! Welcome to the banks of River Moss." },
            { speaker: 'Squire Julian', text: "I am Squire Julian Gingivere. I keep watch over this crossing." },
            { speaker: 'Squire Julian', text: "The fishing is good here, and the waters are healing. Rest if you need to." }
        ]
    },

    // ---- CLUNY ----
    cluny_encounter: {
        lines: [
            { speaker: 'Cluny the Scourge', text: "So... the little mouse warrior dares to face Cluny the Scourge!" },
            { speaker: 'Cluny the Scourge', text: "HAHAHAHA! I have conquered lands from coast to coast!" },
            { speaker: 'Cluny the Scourge', text: "Your precious Abbey will BURN! Every creature inside will serve ME!" },
            { speaker: 'Matthias', text: "Not while I draw breath, Cluny. Redwall will never fall to the likes of you!" },
            { speaker: 'Matthias', text: "For Redwall! EULALIAAAA!" }
        ],
        onComplete: 'start_boss_fight'
    }
};

class DialogueSystem {
    constructor() {
        this.active = false;
        this.currentDialogue = null;
        this.currentLine = 0;
        this.charIndex = 0;
        this.charTimer = 0;
        this.charSpeed = 0.03; // seconds per character
        this.fullText = '';
        this.displayText = '';
        this.lineComplete = false;
        this.dialogueId = null;
        this.npcId = null;
    }

    start(dialogueId, npcId) {
        const dialogue = DialogueDB[dialogueId];
        if (!dialogue) return;

        this.active = true;
        this.currentDialogue = dialogue;
        this.currentLine = 0;
        this.dialogueId = dialogueId;
        this.npcId = npcId;
        this.showLine(0);

        const box = document.getElementById('dialogue-box');
        box.style.display = 'block';
        document.getElementById('ui-overlay').classList.add('active');
    }

    showLine(index) {
        const line = this.currentDialogue.lines[index];
        if (!line) return;

        this.charIndex = 0;
        this.charTimer = 0;
        this.fullText = line.text;
        this.displayText = '';
        this.lineComplete = false;

        document.querySelector('#dialogue-box .speaker').textContent = line.speaker;
        document.querySelector('#dialogue-box .text').textContent = '';
    }

    advance() {
        if (!this.active) return null;

        if (!this.lineComplete) {
            // Skip to end of current line
            this.displayText = this.fullText;
            this.lineComplete = true;
            document.querySelector('#dialogue-box .text').textContent = this.displayText;
            return null;
        }

        this.currentLine++;
        if (this.currentLine >= this.currentDialogue.lines.length) {
            // Dialogue complete
            this.close();
            return {
                dialogueId: this.dialogueId,
                npcId: this.npcId,
                onComplete: this.currentDialogue.onComplete,
                giveItem: this.currentDialogue.giveItem
            };
        }

        this.showLine(this.currentLine);
        AudioSystem.sfx.menuSelect();
        return null;
    }

    close() {
        this.active = false;
        document.getElementById('dialogue-box').style.display = 'none';
        document.getElementById('ui-overlay').classList.remove('active');
    }

    update(dt) {
        if (!this.active || this.lineComplete) return;

        this.charTimer += dt;
        if (this.charTimer >= this.charSpeed) {
            this.charTimer = 0;
            this.charIndex++;
            this.displayText = this.fullText.substring(0, this.charIndex);
            document.querySelector('#dialogue-box .text').textContent = this.displayText;

            if (this.charIndex >= this.fullText.length) {
                this.lineComplete = true;
            }
        }
    }
}
