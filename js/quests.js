// ============================================================
// Redwall: The Warrior's Quest - Quest System
// ============================================================

const QuestDB = {
    main_quest: {
        title: 'Defend Redwall Abbey',
        description: 'Cluny the Scourge threatens Redwall. Find the sword of Martin the Warrior and defeat Cluny to save the Abbey.',
        stages: [
            { id: 'talk_methuselah', description: 'Speak to Brother Methuselah in the Great Hall about the sword.' },
            { id: 'find_sword', description: 'Search the Abbey to find the sword of Martin the Warrior.' },
            { id: 'defeat_cluny', description: 'Travel south through Mossflower to defeat Cluny the Scourge.' }
        ]
    },
    find_sword: {
        title: 'The Sword of Martin',
        description: "Brother Methuselah says the sword is hidden in the Abbey. Search the belltower, cellars, and tunnels.",
        stages: [
            { id: 'search_belltower', description: 'Search the Abbey belltower for clues.' },
            { id: 'search_cellars', description: 'Explore the Abbey cellars and secret passages.' },
            { id: 'find_sword_tunnel', description: 'Find the sword in the Abbey tunnels.' }
        ]
    },
    otter_help: {
        title: 'Rally the Otters',
        description: 'Skipper asks you to clear vermin from the deep woods to gain the otters as allies.',
        stages: [
            { id: 'clear_vermin', description: 'Defeat the vermin in Mossflower Deep.' },
            { id: 'report_skipper', description: 'Return to Skipper and report your success.' }
        ]
    }
};

class QuestSystem {
    constructor() {
        this.activeQuests = {};   // questId -> { currentStage: 0, completed: false }
        this.completedQuests = {};
        this.flags = {};          // Global game flags
    }

    startQuest(questId) {
        if (this.activeQuests[questId] || this.completedQuests[questId]) return false;
        const quest = QuestDB[questId];
        if (!quest) return false;

        this.activeQuests[questId] = {
            currentStage: 0,
            completed: false
        };
        return true;
    }

    advanceQuest(questId) {
        const state = this.activeQuests[questId];
        if (!state || state.completed) return false;
        const quest = QuestDB[questId];

        state.currentStage++;
        if (state.currentStage >= quest.stages.length) {
            state.completed = true;
            this.completedQuests[questId] = true;
            return 'complete';
        }
        return 'advanced';
    }

    isQuestActive(questId) {
        return !!this.activeQuests[questId] && !this.activeQuests[questId].completed;
    }

    isQuestComplete(questId) {
        return !!this.completedQuests[questId];
    }

    getCurrentStageId(questId) {
        const state = this.activeQuests[questId];
        if (!state) return null;
        const quest = QuestDB[questId];
        return quest.stages[state.currentStage]?.id || null;
    }

    setFlag(flag, value) {
        this.flags[flag] = value !== undefined ? value : true;
    }

    getFlag(flag) {
        return this.flags[flag];
    }

    serialize() {
        return {
            activeQuests: JSON.parse(JSON.stringify(this.activeQuests)),
            completedQuests: { ...this.completedQuests },
            flags: { ...this.flags }
        };
    }

    deserialize(data) {
        this.activeQuests = data.activeQuests || {};
        this.completedQuests = data.completedQuests || {};
        this.flags = data.flags || {};
    }
}

function renderQuestLog(questSystem) {
    const container = document.getElementById('quest-entries');
    container.innerHTML = '';

    let hasQuests = false;

    for (const [questId, state] of Object.entries(questSystem.activeQuests)) {
        const quest = QuestDB[questId];
        if (!quest) continue;
        hasQuests = true;

        const entry = document.createElement('div');
        entry.className = 'quest-entry' + (state.completed ? ' completed' : '');

        let stageText = '';
        if (!state.completed && quest.stages[state.currentStage]) {
            stageText = quest.stages[state.currentStage].description;
        } else if (state.completed) {
            stageText = 'Quest completed!';
        }

        entry.innerHTML = `
            <div class="quest-title">${quest.title}</div>
            <div>${quest.description}</div>
            <div style="color: #FFD700; margin-top: 6px; font-style: italic;">${stageText}</div>
        `;
        container.appendChild(entry);
    }

    if (!hasQuests) {
        container.innerHTML = '<div style="text-align: center; color: #CD853F; padding: 20px;">No active quests. Speak to the Abbey creatures to learn what needs to be done.</div>';
    }
}
