// ============================================================
// Redwall: The Warrior's Quest - Audio System (Web Audio API)
// ============================================================

const AudioSystem = {
    ctx: null,
    enabled: true,
    masterVolume: 0.3,
    musicVolume: 0.2,
    sfxVolume: 0.4,
    currentMusic: null,
    musicGain: null,
    sfxGain: null,

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.ctx.destination);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.ctx.destination);
        } catch (e) {
            this.enabled = false;
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // Generate a simple tone
    playTone(freq, duration, type, volume, dest) {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime((volume || 0.3) * this.masterVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(dest || this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // Play a sequence of tones (simple melody)
    playMelody(notes, tempo, type, volume, dest) {
        if (!this.enabled || !this.ctx) return;
        const beatDuration = 60 / (tempo || 120);
        let time = this.ctx.currentTime;
        for (const note of notes) {
            if (note.freq > 0) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type || 'square';
                osc.frequency.setValueAtTime(note.freq, time);
                const dur = beatDuration * (note.dur || 1);
                gain.gain.setValueAtTime((volume || 0.15) * this.masterVolume, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.01);
                osc.connect(gain);
                gain.connect(dest || this.sfxGain);
                osc.start(time);
                osc.stop(time + dur);
            }
            time += beatDuration * (note.dur || 1);
        }
    },

    // Sound effects
    sfx: {
        swordSwing() {
            AudioSystem.playTone(800, 0.08, 'sawtooth', 0.2);
            setTimeout(() => AudioSystem.playTone(400, 0.1, 'sawtooth', 0.15), 40);
        },

        swordHit() {
            AudioSystem.playTone(200, 0.15, 'sawtooth', 0.3);
            AudioSystem.playTone(100, 0.2, 'square', 0.2);
        },

        playerHurt() {
            AudioSystem.playTone(300, 0.1, 'square', 0.3);
            setTimeout(() => AudioSystem.playTone(200, 0.15, 'square', 0.25), 80);
        },

        enemyDeath() {
            AudioSystem.playTone(400, 0.1, 'square', 0.2);
            setTimeout(() => AudioSystem.playTone(300, 0.1, 'square', 0.18), 80);
            setTimeout(() => AudioSystem.playTone(200, 0.15, 'square', 0.15), 160);
            setTimeout(() => AudioSystem.playTone(100, 0.2, 'square', 0.1), 240);
        },

        pickup() {
            AudioSystem.playMelody([
                { freq: 523, dur: 0.3 },
                { freq: 659, dur: 0.3 },
                { freq: 784, dur: 0.5 }
            ], 300, 'square', 0.2);
        },

        questComplete() {
            AudioSystem.playMelody([
                { freq: 523, dur: 0.25 },
                { freq: 659, dur: 0.25 },
                { freq: 784, dur: 0.25 },
                { freq: 1047, dur: 0.5 }
            ], 240, 'square', 0.25);
        },

        doorOpen() {
            AudioSystem.playTone(150, 0.3, 'triangle', 0.2);
            setTimeout(() => AudioSystem.playTone(200, 0.2, 'triangle', 0.15), 150);
        },

        menuSelect() {
            AudioSystem.playTone(440, 0.08, 'square', 0.15);
        },

        menuConfirm() {
            AudioSystem.playTone(523, 0.06, 'square', 0.15);
            setTimeout(() => AudioSystem.playTone(659, 0.08, 'square', 0.15), 60);
        },

        heal() {
            AudioSystem.playMelody([
                { freq: 440, dur: 0.3 },
                { freq: 554, dur: 0.3 },
                { freq: 659, dur: 0.4 }
            ], 280, 'sine', 0.2);
        },

        levelUp() {
            AudioSystem.playMelody([
                { freq: 523, dur: 0.2 },
                { freq: 659, dur: 0.2 },
                { freq: 784, dur: 0.2 },
                { freq: 1047, dur: 0.2 },
                { freq: 784, dur: 0.15 },
                { freq: 1047, dur: 0.4 }
            ], 300, 'square', 0.25);
        },

        bossAppear() {
            AudioSystem.playMelody([
                { freq: 147, dur: 0.5 },
                { freq: 139, dur: 0.5 },
                { freq: 131, dur: 0.5 },
                { freq: 123, dur: 1.0 }
            ], 120, 'sawtooth', 0.3);
        },

        footstep() {
            AudioSystem.playTone(80 + Math.random() * 40, 0.05, 'triangle', 0.05);
        }
    },

    // Music tracks using procedural generation
    music: {
        currentLoop: null,
        currentTrack: null,

        stop() {
            if (this.currentLoop) {
                clearInterval(this.currentLoop);
                this.currentLoop = null;
                this.currentTrack = null;
            }
        },

        playTitle() {
            this.stop();
            this.currentTrack = 'title';
            const notes = [
                // Redwall theme - warm, medieval feel
                { freq: 330, dur: 1 }, { freq: 392, dur: 1 }, { freq: 440, dur: 2 },
                { freq: 392, dur: 1 }, { freq: 349, dur: 1 }, { freq: 330, dur: 2 },
                { freq: 294, dur: 1 }, { freq: 330, dur: 1 }, { freq: 392, dur: 1 },
                { freq: 440, dur: 1 }, { freq: 392, dur: 2 }, { freq: 0, dur: 1 },
                { freq: 330, dur: 1 }, { freq: 349, dur: 1 }, { freq: 392, dur: 2 },
                { freq: 349, dur: 1 }, { freq: 330, dur: 1 }, { freq: 294, dur: 2 },
                { freq: 262, dur: 1 }, { freq: 294, dur: 1 }, { freq: 330, dur: 2 },
                { freq: 0, dur: 2 }
            ];
            const playLoop = () => {
                if (this.currentTrack !== 'title') return;
                AudioSystem.playMelody(notes, 100, 'triangle', 0.12, AudioSystem.musicGain);
            };
            playLoop();
            const totalBeats = notes.reduce((s, n) => s + (n.dur || 1), 0);
            const loopMs = (totalBeats * 60 / 100) * 1000;
            this.currentLoop = setInterval(playLoop, loopMs);
        },

        playExploration() {
            this.stop();
            this.currentTrack = 'explore';
            const notes = [
                { freq: 262, dur: 1 }, { freq: 330, dur: 0.5 }, { freq: 392, dur: 1.5 },
                { freq: 349, dur: 1 }, { freq: 330, dur: 0.5 }, { freq: 294, dur: 1.5 },
                { freq: 262, dur: 1 }, { freq: 294, dur: 0.5 }, { freq: 330, dur: 1 },
                { freq: 392, dur: 0.5 }, { freq: 349, dur: 1.5 }, { freq: 0, dur: 1 },
                { freq: 294, dur: 1 }, { freq: 330, dur: 0.5 }, { freq: 349, dur: 1.5 },
                { freq: 392, dur: 1 }, { freq: 440, dur: 0.5 }, { freq: 392, dur: 1 },
                { freq: 349, dur: 0.5 }, { freq: 330, dur: 1.5 }, { freq: 0, dur: 1.5 }
            ];
            const playLoop = () => {
                if (this.currentTrack !== 'explore') return;
                AudioSystem.playMelody(notes, 90, 'triangle', 0.08, AudioSystem.musicGain);
            };
            playLoop();
            const totalBeats = notes.reduce((s, n) => s + (n.dur || 1), 0);
            const loopMs = (totalBeats * 60 / 90) * 1000;
            this.currentLoop = setInterval(playLoop, loopMs);
        },

        playCombat() {
            this.stop();
            this.currentTrack = 'combat';
            const notes = [
                { freq: 196, dur: 0.5 }, { freq: 233, dur: 0.5 }, { freq: 262, dur: 0.5 },
                { freq: 196, dur: 0.5 }, { freq: 233, dur: 0.5 }, { freq: 294, dur: 0.5 },
                { freq: 262, dur: 0.5 }, { freq: 233, dur: 0.5 },
                { freq: 196, dur: 0.5 }, { freq: 262, dur: 0.5 }, { freq: 233, dur: 0.5 },
                { freq: 196, dur: 0.5 }, { freq: 175, dur: 0.5 }, { freq: 196, dur: 0.5 },
                { freq: 233, dur: 0.5 }, { freq: 262, dur: 0.5 }
            ];
            const playLoop = () => {
                if (this.currentTrack !== 'combat') return;
                AudioSystem.playMelody(notes, 160, 'square', 0.1, AudioSystem.musicGain);
            };
            playLoop();
            const totalBeats = notes.reduce((s, n) => s + (n.dur || 1), 0);
            const loopMs = (totalBeats * 60 / 160) * 1000;
            this.currentLoop = setInterval(playLoop, loopMs);
        },

        playBoss() {
            this.stop();
            this.currentTrack = 'boss';
            const notes = [
                { freq: 147, dur: 1 }, { freq: 156, dur: 1 }, { freq: 165, dur: 0.5 },
                { freq: 147, dur: 0.5 }, { freq: 131, dur: 1 },
                { freq: 147, dur: 0.5 }, { freq: 165, dur: 0.5 }, { freq: 196, dur: 1 },
                { freq: 175, dur: 1 }, { freq: 165, dur: 0.5 }, { freq: 147, dur: 0.5 },
                { freq: 131, dur: 1 }, { freq: 147, dur: 1 },
                { freq: 0, dur: 0.5 }
            ];
            const playLoop = () => {
                if (this.currentTrack !== 'boss') return;
                AudioSystem.playMelody(notes, 130, 'sawtooth', 0.1, AudioSystem.musicGain);
            };
            playLoop();
            const totalBeats = notes.reduce((s, n) => s + (n.dur || 1), 0);
            const loopMs = (totalBeats * 60 / 130) * 1000;
            this.currentLoop = setInterval(playLoop, loopMs);
        },

        playVictory() {
            this.stop();
            this.currentTrack = 'victory';
            const notes = [
                { freq: 392, dur: 0.5 }, { freq: 440, dur: 0.5 }, { freq: 523, dur: 1 },
                { freq: 440, dur: 0.5 }, { freq: 523, dur: 0.5 }, { freq: 659, dur: 1 },
                { freq: 523, dur: 0.5 }, { freq: 659, dur: 0.5 }, { freq: 784, dur: 1.5 },
                { freq: 0, dur: 1 },
                { freq: 523, dur: 0.5 }, { freq: 659, dur: 0.5 }, { freq: 784, dur: 0.5 },
                { freq: 1047, dur: 2 }, { freq: 0, dur: 2 }
            ];
            AudioSystem.playMelody(notes, 120, 'triangle', 0.15, AudioSystem.musicGain);
        }
    }
};
