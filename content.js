// Enhanced VideoLooper with crossfade looping
class VideoLooper {
    constructor() {
        this.state = {
            activeMedia: null,
            pointA: null,
            pointB: null,
            isLooping: false,
            playbackRate: 1.0,
            crossfadeDuration: 0.03 // 30ms crossfade
        };
        this.audioContext = null;
        this.sourceNode = null;
        this.gainNode = null;
        this.crossfadeGainA = null;
        this.crossfadeGainB = null;
        this.isInCrossfade = false;
    }

    async setupAudioNodes(mediaElement) {
        try {
            // Don't create duplicate audio contexts
            if (this.audioContext && this.sourceNode) {
                console.log('Audio already set up, skipping...');
                return;
            }

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Check if media element already has a source node attached
            if (!mediaElement._audioSourceConnected) {
                this.sourceNode = this.audioContext.createMediaElementSource(mediaElement);
                mediaElement._audioSourceConnected = true;
            } else {
                console.warn('MediaElementSource already exists, using basic looping');
                return;
            }

            this.gainNode = this.audioContext.createGain();
            this.crossfadeGainA = this.audioContext.createGain();
            this.crossfadeGainB = this.audioContext.createGain();

            // Buffer for edge bleed playback
            this.edgeBleedBuffer = null;
            this.edgeBleedSource = null;

            // Connect audio graph for crossfading
            this.sourceNode.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
        } catch (e) {
            console.warn('Web Audio setup failed, using basic looping:', e.message);
        }
    }

    async captureEdgeBleed() {
        if (!this.audioContext || !this.state.activeMedia) return;

        try {
            // Calculate the section we need to capture from point A
            const bleedDuration = this.state.crossfadeDuration;
            const startTime = this.state.pointA;

            // Create offline context to render the edge audio
            const sampleRate = this.audioContext.sampleRate;
            const offlineContext = new OfflineAudioContext(2, sampleRate * bleedDuration, sampleRate);

            // We'll capture this during actual playback instead of pre-rendering
            // Store the current position to capture from
            this.edgeBleedCapturePoint = startTime;

        } catch (e) {
            console.warn('Edge bleed capture failed:', e);
        }
    }

    setPointA() {
        if (!this.state.activeMedia) return;
        this.state.pointA = this.state.activeMedia.currentTime;
        console.log(`Point A: ${this.state.pointA.toFixed(3)}s`);
    }

    setPointB() {
        if (!this.state.activeMedia || this.state.pointA === null) return;
        this.state.pointB = this.state.activeMedia.currentTime;
        if (this.state.pointB > this.state.pointA) {
            console.log(`Point B: ${this.state.pointB.toFixed(3)}s`);
            this.startLoop();
        }
    }

    startLoop() {
        if (!this.state.activeMedia || this.state.pointA === null || this.state.pointB === null) return;

        this.state.isLooping = true;
        this.state.activeMedia.currentTime = this.state.pointA;
        this.state.activeMedia.play();

        const checkLoop = () => {
            if (!this.state.isLooping) return;

            const currentTime = this.state.activeMedia.currentTime;
            const loopLength = this.state.pointB - this.state.pointA;
            const crossfadeStart = this.state.pointB - this.state.crossfadeDuration;

            // Start crossfade when approaching point B
            if (currentTime >= crossfadeStart && currentTime < this.state.pointB && !this.isInCrossfade) {
                this.startCrossfade();
            }

            // Hard cut if we somehow pass point B without crossfading
            if (currentTime >= this.state.pointB) {
                this.state.activeMedia.currentTime = this.state.pointA;
                this.isInCrossfade = false;
            }

            requestAnimationFrame(checkLoop);
        };
        checkLoop();
    }

    startCrossfade() {
        if (!this.audioContext || this.isInCrossfade) return;

        this.isInCrossfade = true;
        const now = this.audioContext.currentTime;
        const fadeDuration = this.state.crossfadeDuration;

        // Start fading out the current playback
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
        this.gainNode.gain.linearRampToValueAtTime(0, now + fadeDuration);

        // Jump to point A immediately but keep it at zero volume initially
        // This creates the "overlap" effect
        setTimeout(() => {
            if (this.state.isLooping) {
                this.state.activeMedia.currentTime = this.state.pointA;

                // Fade back in at point A
                const fadeNow = this.audioContext.currentTime;
                this.gainNode.gain.cancelScheduledValues(fadeNow);
                this.gainNode.gain.setValueAtTime(0, fadeNow);
                this.gainNode.gain.linearRampToValueAtTime(1, fadeNow + fadeDuration);

                this.isInCrossfade = false;
            }
        }, fadeDuration * 500); // Jump halfway through the crossfade for overlap
    }

    stopLoop() {
        this.state.isLooping = false;
        this.isInCrossfade = false;
        console.log('Loop stopped');
    }

    adjustPlaybackRate(delta) {
        if (!this.state.activeMedia) return;
        this.state.playbackRate = Math.max(0.25, Math.min(2.0, this.state.playbackRate + delta));
        this.state.activeMedia.playbackRate = this.state.playbackRate;
        console.log(`Playback rate: ${this.state.playbackRate.toFixed(2)}x`);
    }

    jogPointA(deltaSeconds) {
        if (this.state.pointA === null) return;
        this.state.pointA = Math.max(0, this.state.pointA + deltaSeconds);
        if (this.state.pointB && this.state.pointA >= this.state.pointB) {
            this.state.pointA = this.state.pointB - 0.1;
        }
        console.log(`Point A jogged: ${this.state.pointA.toFixed(3)}s`);
    }

    jogPointB(deltaSeconds) {
        if (this.state.pointB === null) return;
        const maxTime = this.state.activeMedia ? this.state.activeMedia.duration : Infinity;
        this.state.pointB = Math.min(maxTime, this.state.pointB + deltaSeconds);
        if (this.state.pointA && this.state.pointB <= this.state.pointA) {
            this.state.pointB = this.state.pointA + 0.1;
        }
        console.log(`Point B jogged: ${this.state.pointB.toFixed(3)}s`);
    }
}

// HighQualityAudioEngine
class HighQualityAudioEngine {
    constructor() {
        this.audioContext = null;
        this.sourceNode = null;
        this.gainNode = null;
        this.analyser = null;
        this.filters = {};
        this.compressor = null;
    }

    async setupHighQualityAudio(mediaElement) {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 48000,
                latencyHint: 'playback'
            });

            this.sourceNode = this.audioContext.createMediaElementSource(mediaElement);
            this.gainNode = this.audioContext.createGain();
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.analyser = this.audioContext.createAnalyser();

            // EQ filters
            this.filters.low = this.audioContext.createBiquadFilter();
            this.filters.low.type = 'lowshelf';
            this.filters.low.frequency.value = 320;

            this.filters.mid = this.audioContext.createBiquadFilter();
            this.filters.mid.type = 'peaking';
            this.filters.mid.frequency.value = 1000;
            this.filters.mid.Q.value = 0.5;

            this.filters.high = this.audioContext.createBiquadFilter();
            this.filters.high.type = 'highshelf';
            this.filters.high.frequency.value = 3200;

            // Connect audio graph
            this.sourceNode
                .connect(this.filters.low)
                .connect(this.filters.mid)
                .connect(this.filters.high)
                .connect(this.compressor)
                .connect(this.gainNode)
                .connect(this.analyser)
                .connect(this.audioContext.destination);

            console.log('High-quality audio engine initialized');
        } catch (e) {
            console.warn('Audio context failed:', e);
        }
    }

    setVolume(value) {
        if (!this.gainNode) return;
        const gain = value / 100;
        this.gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }
}

// LoopManipulator
class LoopManipulator {
    constructor() {
        this.state = {
            activeMedia: null,
            originalLoopStart: null,
            originalLoopEnd: null,
            snapGrid: 0.1
        };
    }

    setLoopPoints(looper) {
        this.state.originalLoopStart = looper.state.pointA;
        this.state.originalLoopEnd = looper.state.pointB;
    }

    doubleLoopLength(looper) {
        if (!looper.state.pointA || !looper.state.pointB) return;
        const currentLength = looper.state.pointB - looper.state.pointA;
        looper.state.pointB = looper.state.pointA + (currentLength * 2);

        if (this.state.activeMedia && looper.state.pointB > this.state.activeMedia.duration) {
            looper.state.pointB = this.state.activeMedia.duration;
        }

        console.log(`Loop doubled: ${currentLength.toFixed(2)}s → ${(looper.state.pointB - looper.state.pointA).toFixed(2)}s`);
        if (looper.state.isLooping) looper.startLoop();
    }

    halfLoopLength(looper) {
        if (!looper.state.pointA || !looper.state.pointB) return;
        const currentLength = looper.state.pointB - looper.state.pointA;
        const newLength = currentLength / 2;

        if (newLength < 0.1) return;

        looper.state.pointB = looper.state.pointA + newLength;
        console.log(`Loop halved: ${currentLength.toFixed(2)}s → ${newLength.toFixed(2)}s`);
        if (looper.state.isLooping) looper.startLoop();
    }

    jumpSection(looper, direction) {
        if (!looper.state.pointA || !looper.state.pointB) return;

        const loopLength = looper.state.pointB - looper.state.pointA;
        const jumpAmount = loopLength * direction;

        const newA = looper.state.pointA + jumpAmount;
        const newB = looper.state.pointB + jumpAmount;

        // Check bounds
        if (newA >= 0 && this.state.activeMedia && newB <= this.state.activeMedia.duration) {
            looper.state.pointA = newA;
            looper.state.pointB = newB;

            if (looper.state.isLooping) {
                looper.state.activeMedia.currentTime = looper.state.pointA;
            }

            console.log(`Section jump: A=${looper.state.pointA.toFixed(2)}s, B=${looper.state.pointB.toFixed(2)}s`);
        }
    }
}

// DigitalDisplay
class DigitalDisplay {
    constructor() {
        this.displayText = 'READY';
        this.secondaryText = '--------';
    }

    createDisplaySVG() {
        return `
            <svg width="100%" height="80" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <rect width="300" height="80" fill="#200808" stroke="#4a1a17" stroke-width="3" rx="8"/>
                <text id="display-line1" x="150" y="30"
                    font-family="Courier New, monospace"
                    font-size="24"
                    font-weight="bold"
                    fill="#ff3030"
                    text-anchor="middle"
                    filter="url(#glow)"
                    letter-spacing="8">READY</text>
                <text id="display-line2" x="150" y="60"
                    font-family="Courier New, monospace"
                    font-size="24"
                    font-weight="bold"
                    fill="#ff3030"
                    text-anchor="middle"
                    filter="url(#glow)"
                    letter-spacing="8">--------</text>
            </svg>
        `;
    }

    updateDisplayText(line1 = null, line2 = null) {
        if (line1 !== null) this.displayText = line1;
        if (line2 !== null) this.secondaryText = line2;

        const line1Element = document.getElementById('display-line1');
        const line2Element = document.getElementById('display-line2');

        if (line1Element) line1Element.textContent = this.displayText;
        if (line2Element) line2Element.textContent = this.secondaryText;
    }

    formatTime(seconds) {
        if (seconds === null || seconds === undefined) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showLoopInfo(looper) {
        if (looper.state.pointA !== null && looper.state.pointB !== null) {
            const loopLength = looper.state.pointB - looper.state.pointA;
            this.updateDisplayText(
                `LOOP ${this.formatTime(looper.state.pointA)}`,
                `LEN ${loopLength.toFixed(2)}s`
            );
        } else if (looper.state.pointA !== null) {
            this.updateDisplayText(
                `A: ${this.formatTime(looper.state.pointA)}`,
                'SET B'
            );
        } else {
            this.updateDisplayText('READY', '--------');
        }
    }
}

// Parameter persistence
class ParameterStore {
    constructor() {
        this.currentVideoUrl = null;
        this.parameters = {
            volume: 50,
            tempo: 50
        };
        this.continuousApplyInterval = null;
    }

    updateCurrentVideo(videoElement) {
        const newVideoUrl = window.location.href;

        // Reset parameters when switching videos
        if (this.currentVideoUrl && this.currentVideoUrl !== newVideoUrl) {
            this.resetParameters();
        }

        this.currentVideoUrl = newVideoUrl;
        this.startContinuousApply(videoElement);
    }

    resetParameters() {
        this.parameters = {
            volume: 50,
            tempo: 50
        };
    }

    setParameter(param, value) {
        this.parameters[param] = value;
    }

    getParameter(param) {
        return this.parameters[param];
    }

    startContinuousApply(videoElement) {
        // Clear existing interval
        if (this.continuousApplyInterval) {
            clearInterval(this.continuousApplyInterval);
        }

        // Apply parameters initially
        this.applyParameters(videoElement);

        // Apply parameters every 500ms to prevent resets (reduced frequency to avoid glitching)
        this.continuousApplyInterval = setInterval(() => {
            if (videoElement) {
                this.applyParameters(videoElement);
            }
        }, 500);
    }

    applyParameters(videoElement) {
        // Apply volume
        const targetVolume = this.parameters.volume / 100;
        if (Math.abs(videoElement.volume - targetVolume) > 0.01) {
            videoElement.volume = targetVolume;
        }

        // Apply tempo/playback rate - 50 = 1.0x (noon position)
        // Range: 0 = 0.5x, 50 = 1.0x, 100 = 2.0x
        const targetRate = this.parameters.tempo <= 50
            ? 0.5 + (this.parameters.tempo / 50) * 0.5  // 0-50 maps to 0.5-1.0
            : 1.0 + ((this.parameters.tempo - 50) / 50) * 1.0;  // 50-100 maps to 1.0-2.0
        if (Math.abs(videoElement.playbackRate - targetRate) > 0.01) {
            videoElement.playbackRate = targetRate;
        }
    }

    stopContinuousApply() {
        if (this.continuousApplyInterval) {
            clearInterval(this.continuousApplyInterval);
            this.continuousApplyInterval = null;
        }
    }
}

// Main extension logic
let pedalVisible = false;
let parameterStore = new ParameterStore();

function createLoopStation() {
    if (pedalVisible || document.querySelector('.yt-loop-pedal')) return;

    const videoEl = document.querySelector('video');
    if (!videoEl) {
        console.log('No video found on page');
        return;
    }

    // Create pedal container with your exact styling
    const pedalHTML = `
        <div class="yt-loop-pedal" style="
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: #c42821;
            width: 280px;
            border-radius: 14px;
            padding: 10px;
            box-shadow: 0 14px 28px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.2);
            font-family: Arial, sans-serif;
        ">
            <!-- Drag Bar and Close Button -->
            <div id="dragBar" style="
                position: absolute;
                top: -3px;
                left: 20px;
                right: 35px;
                height: 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px 10px 0 0;
                cursor: move;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    width: 30px;
                    height: 3px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                "></div>
            </div>

            <!-- Control Panel -->
            <div style="
                background: linear-gradient(135deg, #3a0a07 0%, #1a0504 100%);
                border-radius: 10px;
                padding: 14px;
                margin-bottom: 10px;
                box-shadow: inset 0 2px 6px rgba(0,0,0,0.7);
            ">
                <!-- LCD Display -->
                <div id="displayContainer" style="
                    background: #200808;
                    border: 2px solid #4a1a17;
                    border-radius: 6px;
                    padding: 0;
                    margin-bottom: 14px;
                    box-shadow: inset 0 1px 4px rgba(0,0,0,0.9);
                    overflow: hidden;
                    height: 56px;
                "></div>

                <!-- Controls Container -->
                <div style="
                    display: flex;
                    gap: 14px;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-top: -7px;
                ">
                    <!-- Knobs Section -->
                    <div style="
                        display: flex;
                        gap: 21px;
                        margin-top: 14px;
                    ">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="large-knob" data-param="vol" data-value="50" style="
                                width: 49px;
                                height: 49px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%);
                                border: 3px solid #000;
                                box-shadow: 0 3px 7px rgba(0,0,0,0.8), inset 0 -1px 3px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.2);
                                position: relative;
                                cursor: pointer;
                                transform: rotate(-135deg);
                                transition: transform 0.1s ease;
                            ">
                                <div style="
                                    content: '';
                                    position: absolute;
                                    width: 3px;
                                    height: 21px;
                                    background: linear-gradient(180deg, #fff 0%, #ccc 100%);
                                    top: 6px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    border-radius: 2px;
                                    box-shadow: 0 0 2px rgba(255,255,255,0.5);
                                "></div>
                            </div>
                            <label style="
                                color: #fff;
                                font-size: 8px;
                                font-weight: bold;
                                text-transform: uppercase;
                                margin-top: 6px;
                                letter-spacing: 1px;
                                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                            ">VOL</label>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="large-knob" data-param="tempo" data-value="50" style="
                                width: 49px;
                                height: 49px;
                                border-radius: 50%;
                                background: linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 100%);
                                border: 3px solid #000;
                                box-shadow: 0 3px 7px rgba(0,0,0,0.8), inset 0 -1px 3px rgba(0,0,0,0.6), inset 0 1px 3px rgba(255,255,255,0.2);
                                position: relative;
                                cursor: pointer;
                                transform: rotate(-135deg);
                                transition: transform 0.1s ease;
                            ">
                                <div style="
                                    content: '';
                                    position: absolute;
                                    width: 3px;
                                    height: 21px;
                                    background: linear-gradient(180deg, #fff 0%, #ccc 100%);
                                    top: 6px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    border-radius: 2px;
                                    box-shadow: 0 0 2px rgba(255,255,255,0.5);
                                "></div>
                            </div>
                            <label style="
                                color: #fff;
                                font-size: 8px;
                                font-weight: bold;
                                text-transform: uppercase;
                                margin-top: 6px;
                                letter-spacing: 1px;
                                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                            ">TEMPO</label>
                        </div>
                    </div>

                    <!-- Toggle Switches -->
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 14px 10px;
                        margin-top: 14px;
                    ">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="toggle-switch" data-toggle="jog-a" style="
                                position: relative;
                                width: 50px;
                                height: 30px;
                                background: #1a0504;
                                border-radius: 15px;
                                border: 2px solid #000;
                                box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);
                                cursor: pointer;
                            ">
                                <div class="toggle-handle" style="
                                    position: absolute;
                                    width: 22px;
                                    height: 22px;
                                    background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
                                    border-radius: 50%;
                                    top: 2px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    transition: all 0.15s ease;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.5);
                                "></div>
                            </div>
                            <label style="
                                color: rgba(255,255,255,0.8);
                                font-size: 8px;
                                font-weight: bold;
                                text-transform: uppercase;
                                margin-top: 4px;
                                letter-spacing: 0.5px;
                            ">JOG A</label>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="toggle-switch" data-toggle="jog-b" style="
                                position: relative;
                                width: 50px;
                                height: 30px;
                                background: #1a0504;
                                border-radius: 15px;
                                border: 2px solid #000;
                                box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);
                                cursor: pointer;
                            ">
                                <div class="toggle-handle" style="
                                    position: absolute;
                                    width: 22px;
                                    height: 22px;
                                    background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
                                    border-radius: 50%;
                                    top: 2px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    transition: all 0.15s ease;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.5);
                                "></div>
                            </div>
                            <label style="
                                color: rgba(255,255,255,0.8);
                                font-size: 8px;
                                font-weight: bold;
                                text-transform: uppercase;
                                margin-top: 4px;
                                letter-spacing: 0.5px;
                            ">JOG B</label>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="toggle-switch" data-toggle="section" style="
                                position: relative;
                                width: 50px;
                                height: 30px;
                                background: #1a0504;
                                border-radius: 15px;
                                border: 2px solid #000;
                                box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);
                                cursor: pointer;
                            ">
                                <div class="toggle-handle" style="
                                    position: absolute;
                                    width: 22px;
                                    height: 22px;
                                    background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
                                    border-radius: 50%;
                                    top: 2px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    transition: all 0.15s ease;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.5);
                                "></div>
                            </div>
                            <label style="
                                color: rgba(255,255,255,0.8);
                                font-size: 8px;
                                font-weight: bold;
                                text-transform: uppercase;
                                margin-top: 4px;
                                letter-spacing: 0.5px;
                            ">SECTION</label>
                        </div>

                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="toggle-switch" data-toggle="length" style="
                                position: relative;
                                width: 50px;
                                height: 30px;
                                background: #1a0504;
                                border-radius: 15px;
                                border: 2px solid #000;
                                box-shadow: inset 0 2px 5px rgba(0,0,0,0.8);
                                cursor: pointer;
                            ">
                                <div class="toggle-handle" style="
                                    position: absolute;
                                    width: 22px;
                                    height: 22px;
                                    background: linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 100%);
                                    border-radius: 50%;
                                    top: 2px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    transition: all 0.15s ease;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.5);
                                "></div>
                            </div>
                            <label style="
                                color: rgba(255,255,255,0.8);
                                font-size: 8px;
                                font-weight: bold;
                                text-transform: uppercase;
                                margin-top: 4px;
                                letter-spacing: 0.5px;
                            ">LENGTH</label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Middle Section -->
            <div style="
                background: #c42821;
                padding: 25px 20px;
                text-align: center;
            ">
                <img src="${chrome.runtime.getURL('loop-station-text.png')}" alt="Loop Station" style="width: 100%; height: auto; margin-bottom: 5px;" onerror="this.style.display='none'">
            </div>

            <!-- Footswitch Section -->
            <div id="footswitch" style="
                background: linear-gradient(135deg, #2a0a08 0%, #1a0504 100%);
                border-radius: 15px;
                padding: 40px;
                box-shadow: inset 0 3px 8px rgba(0,0,0,0.9);
                position: relative;
                cursor: pointer;
                user-select: none;
                transition: all 0.2s ease;
            ">
                <div style="
                    color: #3a3a3a;
                    font-size: 30px;
                    font-weight: bold;
                    text-align: center;
                    letter-spacing: 2px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                    transition: all 0.2s ease;
                    pointer-events: none;
                ">REC</div>
            </div>

            <!-- Close button -->
            <div style="
                position: absolute;
                top: -7px;
                right: -7px;
                width: 21px;
                height: 21px;
                background: #ff0000;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: white;
                font-weight: bold;
                font-size: 12px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.5);
            " onclick="parameterStore.stopContinuousApply(); document.querySelector('.yt-loop-pedal').remove(); pedalVisible = false;">×</div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', pedalHTML);
    pedalVisible = true;

    // Initialize components
    const looper = new VideoLooper();
    const audio = new HighQualityAudioEngine();
    const manip = new LoopManipulator();
    const display = new DigitalDisplay();

    // Setup connections
    looper.state.activeMedia = videoEl;
    manip.state.activeMedia = videoEl;

    // Update parameter store with current video
    parameterStore.updateCurrentVideo(videoEl);

    // Initialize audio - only setup one audio context to avoid conflicts
    looper.setupAudioNodes(videoEl).then(() => {
        console.log('Loop station initialized');
    }).catch(e => {
        console.warn('Audio setup skipped:', e);
    });

    // Initialize display
    const displayContainer = document.getElementById('displayContainer');
    displayContainer.innerHTML = display.createDisplaySVG();

    // Pedal state
    const pedalState = {
        recording: false,
        playing: false
    };

    // Animation loop
    function renderLoop() {
        if (document.querySelector('.yt-loop-pedal')) {
            display.showLoopInfo(looper);
            requestAnimationFrame(renderLoop);
        }
    }
    renderLoop();

    // Knob handlers
    let knobDisplayTimeout = null;

    document.querySelectorAll('.large-knob').forEach(knob => {
        let isDragging = false;
        let startY = 0;
        let startValue = 0;

        function updateKnobRotation(value, skipAudioUpdate = false) {
            const rotation = -135 + (value * 2.7);
            knob.style.transform = `rotate(${rotation}deg)`;

            if (!skipAudioUpdate) {
                if (knob.dataset.param === 'vol') {
                    // Store parameter and apply immediately
                    parameterStore.setParameter('volume', value);
                    videoEl.volume = value / 100;
                    // Show on display
                    display.updateDisplayText('VOLUME', `${Math.round(value)}%`);
                } else if (knob.dataset.param === 'tempo') {
                    // Store parameter and apply immediately
                    parameterStore.setParameter('tempo', value);
                    const rate = value <= 50
                        ? 0.5 + (value / 50) * 0.5  // 0-50 maps to 0.5-1.0
                        : 1.0 + ((value - 50) / 50) * 1.0;  // 50-100 maps to 1.0-2.0
                    videoEl.playbackRate = rate;
                    // Show on display
                    display.updateDisplayText('TEMPO', `${rate.toFixed(2)}x`);
                }

                // Clear any existing timeout and set new one to restore display after 2 seconds
                clearTimeout(knobDisplayTimeout);
                knobDisplayTimeout = setTimeout(() => {
                    display.showLoopInfo(looper);
                }, 2000);
            }
        }

        knob.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startValue = parseFloat(knob.dataset.value);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaY = startY - e.clientY;
            const newValue = Math.max(0, Math.min(100, startValue + deltaY * 0.5));
            knob.dataset.value = newValue;
            updateKnobRotation(newValue);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Initialize knob position with stored parameter value
        const param = knob.dataset.param === 'vol' ? 'volume' : 'tempo';
        const storedValue = parameterStore.getParameter(param);
        knob.dataset.value = storedValue;
        updateKnobRotation(storedValue, true);
    });

    // Toggle switch handlers
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        let timeoutId = null;
        const toggleName = toggle.dataset.toggle;

        function performAction(direction) {
            switch(toggleName) {
                case 'jog-a':
                    const deltaA = direction === 'left' ? -0.05 : 0.05;
                    looper.jogPointA(deltaA);
                    display.updateDisplayText('JOG A', `${direction === 'left' ? '<<' : '>>'}`);
                    break;
                case 'jog-b':
                    const deltaB = direction === 'left' ? -0.05 : 0.05;
                    looper.jogPointB(deltaB);
                    display.updateDisplayText('JOG B', `${direction === 'left' ? '<<' : '>>'}`);
                    break;
                case 'section':
                    const sectionDir = direction === 'left' ? -1 : 1;
                    manip.jumpSection(looper, sectionDir);
                    display.updateDisplayText('SECTION', direction === 'left' ? 'PREV' : 'NEXT');
                    break;
                case 'length':
                    if (direction === 'left') {
                        manip.halfLoopLength(looper);
                        display.updateDisplayText('LENGTH', '0.5x');
                    } else {
                        manip.doubleLoopLength(looper);
                        display.updateDisplayText('LENGTH', '2.0x');
                    }
                    break;
            }

            // Reset display after 2 seconds
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                display.showLoopInfo(looper);
            }, 2000);
        }

        toggle.addEventListener('mousedown', (e) => {
            const rect = toggle.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const center = rect.width / 2;
            const handle = toggle.querySelector('.toggle-handle');

            if (x < center) {
                handle.style.transform = 'translateX(-18px)';
                performAction('left');
            } else {
                handle.style.transform = 'translateX(5px)';
                performAction('right');
            }
        });

        toggle.addEventListener('mouseup', () => {
            setTimeout(() => {
                const handle = toggle.querySelector('.toggle-handle');
                handle.style.transform = 'translateX(-50%)';
            }, 100);
        });
    });

    // Footswitch handler
    const footswitch = document.getElementById('footswitch');
    const footswitchText = footswitch.querySelector('div');
    footswitch.addEventListener('click', () => {
        if (!pedalState.recording && !pedalState.playing) {
            // First click: Set Point A - show red REC
            pedalState.recording = true;
            footswitchText.textContent = 'REC';
            footswitchText.style.color = '#ff0000';
            footswitchText.style.textShadow = '0 0 20px #ff0000, 0 2px 4px rgba(0,0,0,0.8)';
            looper.setPointA();
            display.updateDisplayText('SET A', display.formatTime(looper.state.pointA));
        } else if (pedalState.recording) {
            // Second click: Set Point B and start loop - show green PLAY
            pedalState.recording = false;
            pedalState.playing = true;
            footswitchText.textContent = 'PLAY';
            footswitchText.style.color = '#00ff00';
            footswitchText.style.textShadow = '0 0 20px #00ff00, 0 2px 4px rgba(0,0,0,0.8)';
            looper.setPointB();
            manip.setLoopPoints(looper);
        } else {
            // Third click: Stop loop - show dark grey REC
            pedalState.playing = false;
            footswitchText.textContent = 'REC';
            footswitchText.style.color = '#3a3a3a';
            footswitchText.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
            looper.stopLoop();
            display.updateDisplayText('STOPPED', '--------');

            // Reset after delay
            setTimeout(() => {
                looper.state.pointA = null;
                looper.state.pointB = null;
                display.updateDisplayText('READY', '--------');
            }, 2000);
        }
    });

    // Add drag functionality
    const dragBar = document.getElementById('dragBar');
    const pedal = document.querySelector('.yt-loop-pedal');
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    dragBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = pedal.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const newLeft = e.clientX - dragOffset.x;
        const newTop = e.clientY - dragOffset.y;

        // Keep within viewport bounds
        const maxLeft = window.innerWidth - pedal.offsetWidth;
        const maxTop = window.innerHeight - pedal.offsetHeight;

        pedal.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
        pedal.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
        pedal.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Listen for extension activation
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle_pedal') {
        if (pedalVisible) {
            const pedal = document.querySelector('.yt-loop-pedal');
            if (pedal) {
                parameterStore.stopContinuousApply();
                pedal.remove();
                pedalVisible = false;
            }
        } else {
            createLoopStation();
        }
        sendResponse({success: true});
    }
});