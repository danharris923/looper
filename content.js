const DEBUG = false;

function debugLog(...args) {
  if (DEBUG) console.log('[YT Loop Station]', ...args);
}

// --- Utility functions ---

function setPreservesPitch(el, value) {
  if ('preservesPitch' in el) el.preservesPitch = value;
  else if ('mozPreservesPitch' in el) el.mozPreservesPitch = value;
  else if ('webkitPreservesPitch' in el) el.webkitPreservesPitch = value;
}

function tempoToRate(tempo) {
  return tempo <= 50
    ? 0.5 + (tempo / 50) * 0.5
    : 1.0 + ((tempo - 50) / 50) * 1.0;
}

function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// --- Boss SVG Pedal Skin Definitions ---
// SVG body templates: just the enclosure (body, panels, footswitch pad, jack nub).
// Controls are overlaid as HTML on top.

const SVG_BODY_4x3 = (body, topA, topB) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="355 70 315 620">
<path fill="#4D494D" d="M535.6 681s-17.4 2-23.2 2c-5.8 0-23.2-2-23.2-2l-3-29h52.4l-3 29z"/>
<path fill="#333030" d="M535.6 681s-17.4-1-23.2-1c-5.8 0-23.2 1-23.2 1l-3-29h52.4l-3 29z"/>
<path fill="${body}" d="M654.2 658H370.5c-5.6 0-10.1-4.6-10.1-10.1v-386c0-5.6 4.6-10.1 10.1-10.1h283.8c5.6 0 10.1 4.6 10.1 10.1v386c0 5.5-4.6 10.1-10.2 10.1z"/>
<path fill="${topA}" d="M657.4 274.2H367.3c-3.8 0-6.9-3.1-6.9-6.9V90.4c0-3.8 3.1-6.9 6.9-6.9h290.1c3.8 0 6.9 3.1 6.9 6.9v176.9c.1 3.8-3.1 6.9-6.9 6.9z"/>
<path fill="${topB}" d="M656.5 657.9H368.2c-5.4 0-9.8-4.4-9.8-9.8V291.3c0-5.4 4.4-9.8 9.8-9.8h288.4c5.4 0 9.8 4.4 9.8 9.8V648c0 5.4-4.5 9.9-9.9 9.9z"/>
<path fill="#333030" d="M644.4 635h-264c-4.9 0-9-4-9-9V460c0-5 4.1-9 9-9h264c5 0 9 4 9 9v166c0 5-4.1 9-9 9z"/>
</svg>`;

const SVG_BODY_1x1 = (body, topA, topB) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="148 82 136 265">
<path fill="#4D494D" d="M225.9 341.3s-7.3.9-9.8.9-9.8-.9-9.8-.9l-1.3-12.2h22.1l-1.2 12.2z"/>
<path fill="#333030" d="M225.9 341.3s-7.3-.4-9.8-.4-9.8.4-9.8.4l-1.3-12.2h22.1l-1.2 12.2z"/>
<path fill="${body}" d="M275.9 331.6H156.3c-2.4 0-4.3-1.9-4.3-4.3V164.5c0-2.4 1.9-4.3 4.3-4.3H276c2.4 0 4.3 1.9 4.3 4.3v162.8c0 2.3-2 4.3-4.4 4.3z"/>
<path fill="${topA}" d="M277.3 169.7H154.9c-1.6 0-2.9-1.3-2.9-2.9V92.1c0-1.6 1.3-2.9 2.9-2.9h122.4c1.6 0 2.9 1.3 2.9 2.9v74.6c.1 1.7-1.3 3-2.9 3z"/>
<path fill="${topB}" d="M276.9 331.5H155.3c-2.3 0-4.1-1.8-4.1-4.1V176.9c0-2.3 1.8-4.1 4.1-4.1H277c2.3 0 4.1 1.8 4.1 4.1v150.4c0 2.3-1.9 4.2-4.2 4.2z"/>
<path fill="#333030" d="M271.8 321.9H160.5c-2.1 0-3.8-1.7-3.8-3.8v-70c0-2.1 1.7-3.8 3.8-3.8h111.3c2.1 0 3.8 1.7 3.8 3.8v70c0 2.1-1.7 3.8-3.8 3.8z"/>
</svg>`;

const SKINS = {
  bd2:  { name: 'Blues Driver',   svg: () => SVG_BODY_4x3('#015077', '#00588C', '#00588C'),   knobFace: '#E7EFF4', textColor: '#fff', swatchColor: '#015077' },
  ds1:  { name: 'Distortion',    svg: () => SVG_BODY_4x3('#FF720B', '#FF8C2A', '#FF8C2A'),   knobFace: '#E7EFF4', textColor: '#fff', swatchColor: '#FF720B' },
  ph1r: { name: 'Phaser',        svg: () => SVG_BODY_4x3('#35D379', '#3DD87F', '#41E58D'),   knobFace: '#E7EFF4', textColor: '#333', swatchColor: '#35D379' },
  dd7:  { name: 'Delay',         svg: () => SVG_BODY_4x3('#D8E1E5', '#E4EEF2', '#E4EEF2'),   knobFace: '#00A9D8', textColor: '#333', swatchColor: '#D8E1E5' },
  ds2:  { name: 'Turbo Dist',    svg: () => SVG_BODY_4x3('#FF720B', '#FF8C2A', '#FF8C2A'),   knobFace: '#FF720B', textColor: '#fff', swatchColor: '#FF8C2A' },
  sd1:  { name: 'Overdrive',     svg: () => SVG_BODY_1x1('#EDBE4B', '#F9CE5C', '#F9D76E'),   knobFace: '#E7EFF4', textColor: '#333', swatchColor: '#EDBE4B' },
  bf2:  { name: 'Flanger',       svg: () => SVG_BODY_1x1('#7D3B61', '#9E5E8A', '#A9618F'),   knobFace: '#D9D9D6', textColor: '#fff', swatchColor: '#7D3B61' },
  ch1:  { name: 'Chorus',        svg: () => SVG_BODY_1x1('#76A7D5', '#A5CAEB', '#B6DDF5'),   knobFace: '#E9F0F4', textColor: '#fff', swatchColor: '#76A7D5' },
};

const SKIN_STORAGE_KEY = 'ytLoopStationSkin';
function getSavedSkin() { return localStorage.getItem(SKIN_STORAGE_KEY) || 'bd2'; }
function saveSkin(id) { localStorage.setItem(SKIN_STORAGE_KEY, id); }

// --- SVG Knob Helpers ---

function knurledPath(cx, cy, r, teeth) {
  const inner = r * 0.92;
  const total = teeth * 2;
  const pts = [];
  for (let i = 0; i < total; i++) {
    const a = (i / total) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return 'M' + pts.join('L') + 'Z';
}

function butterflyPaths(cx, cy, b) {
  return [
    `M${(cx+b).toFixed(1)},${(cy-b).toFixed(1)}c${(-b*.56).toFixed(1)},${(-b*.56).toFixed(1)},${(-b*1.45).toFixed(1)},${(-b*.56).toFixed(1)},${(-b*2).toFixed(1)},0L${cx},${cy}Z`,
    `M${cx},${cy}L${(cx-b).toFixed(1)},${(cy+b).toFixed(1)}c${(b*.56).toFixed(1)},${(b*.56).toFixed(1)},${(b*1.45).toFixed(1)},${(b*.56).toFixed(1)},${(b*2).toFixed(1)},0Z`
  ];
}

// --- CSS Injection ---

function injectStyles() {
  if (document.getElementById('yt-loop-station-styles')) return;
  const style = document.createElement('style');
  style.id = 'yt-loop-station-styles';
  style.textContent = `
    .ytls-pedal {
      --knob-face: #E7EFF4;
      --text-color: #fff;
      position: fixed; top: 10px; right: 10px; z-index: 999999;
      width: 280px; font-family: Arial, Helvetica, sans-serif;
      transform: scale(0.7); transform-origin: top right;
      user-select: none; cursor: default;
    }
    .ytls-pedal.ytls-scaled { transform: scale(0.95); transform-origin: top right; }

    /* SVG pedal body - the actual Boss artwork */
    .ytls-skin-layer { position: relative; }
    .ytls-svg-container svg { width: 100%; height: auto; display: block; }

    /* Controls overlay - sits on top of the SVG */
    .ytls-overlay {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
    }
    .ytls-overlay > * { pointer-events: auto; }

    /* Close & Settings buttons */
    .ytls-close-btn {
      position: absolute; top: -8px; right: -8px;
      width: 22px; height: 22px; border-radius: 50%;
      background: #e33; border: 2px solid #fff;
      color: #fff; font-size: 13px; line-height: 22px;
      text-align: center; cursor: pointer; z-index: 10;
      font-weight: bold; pointer-events: auto;
    }
    .ytls-close-btn:hover { background: #f55; }
    .ytls-settings-btn {
      position: absolute; top: -8px; left: -8px;
      width: 22px; height: 22px; border-radius: 50%;
      background: #555; border: 2px solid #fff;
      color: #fff; font-size: 13px; line-height: 22px;
      text-align: center; cursor: pointer; z-index: 10;
      pointer-events: auto;
    }
    .ytls-settings-btn:hover { background: #777; }

    /* Drag zone at top of pedal */
    .ytls-drag-zone {
      position: absolute; top: 3.5%; left: 10%; width: 80%; height: 4%;
      cursor: grab; display: flex; align-items: center;
      justify-content: center; gap: 4px;
    }
    .ytls-drag-dot {
      width: 3px; height: 3px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
    }

    /* LCD display - positioned over the upper panel area */
    .ytls-lcd-wrap {
      position: absolute; top: 8%; left: 8%; width: 84%;
    }
    .ytls-lcd {
      width: 100%; height: auto; display: block;
      border-radius: 3px;
    }
    .ytls-lcd-text {
      fill: #ff3333; font-family: 'Courier New', Courier, monospace; font-size: 13px;
    }
    .ytls-lcd-glow { filter: url(#ytls-glow); }

    /* LED indicator */
    .ytls-led {
      position: absolute; top: 20%; left: 50%;
      width: 10px; height: 10px; border-radius: 50%;
      transform: translateX(-50%);
      background: #330008; border: 1px solid #222;
      transition: background 0.15s, box-shadow 0.15s;
    }
    .ytls-led.on {
      background: #F00025;
      box-shadow: 0 0 8px 2px rgba(255,0,37,0.6);
    }

    /* Knobs - positioned over the upper panel */
    .ytls-knob-left {
      position: absolute; top: 22%; left: 8%;
      width: 38%; display: flex; flex-direction: column; align-items: center;
    }
    .ytls-knob-right {
      position: absolute; top: 22%; right: 8%;
      width: 38%; display: flex; flex-direction: column; align-items: center;
    }
    .ytls-knob {
      width: 80%; max-width: 76px; display: block; cursor: ns-resize;
    }
    .ytls-knob-face { fill: var(--knob-face); }
    .ytls-knob-label {
      color: var(--text-color); font-size: 9px;
      margin-top: 1px; text-transform: uppercase;
      letter-spacing: 1.5px; font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    }

    /* Middle section - toggles + logo over the pedal body */
    .ytls-mid-section {
      position: absolute; top: 45%; left: 5%; width: 90%;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .ytls-toggles-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 4px 10px; width: 100%;
    }
    .ytls-toggle-group { text-align: center; }
    .ytls-toggle-track {
      width: 38px; height: 15px; background: #1a1a1a;
      border-radius: 3px; margin: 0 auto; position: relative;
      cursor: pointer; border: 1px solid #444;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
    }
    .ytls-toggle-handle {
      width: 15px; height: 11px;
      background: linear-gradient(to bottom, #ccc, #888);
      border-radius: 2px; position: absolute;
      top: 2px; left: 11px; transition: left 0.08s;
      box-shadow: 0 1px 2px rgba(0,0,0,0.4);
    }
    .ytls-toggle-handle.left { left: 1px; }
    .ytls-toggle-handle.right { left: 22px; }
    .ytls-toggle-label {
      color: var(--text-color); font-size: 7px;
      margin-top: 1px; text-transform: uppercase;
      letter-spacing: 0.5px; opacity: 0.8;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    /* Logo section */
    .ytls-logo-section {
      padding: 2px 0;
    }
    .ytls-logo-section img {
      height: 22px; opacity: 0.9;
    }

    /* Footswitch - positioned over the dark pad in the SVG */
    .ytls-footswitch-wrap {
      position: absolute; top: 63.5%; left: 8%; width: 84%; height: 24%;
      display: flex; align-items: center; justify-content: center;
    }
    .ytls-footswitch {
      width: 100%; height: 100%; border-radius: 6px;
      background: transparent; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #999; font-size: 14px; font-weight: bold;
      letter-spacing: 3px; text-transform: uppercase;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
      transition: color 0.15s;
    }
    .ytls-footswitch:active { background: rgba(0,0,0,0.15); }
    .ytls-footswitch.rec { color: #ff4444; }
    .ytls-footswitch.play { color: #44ff44; }

    /* Settings panel - below the pedal SVG */
    .ytls-settings-panel {
      display: none; background: #1a1a1a;
      border-radius: 0 0 10px 10px;
      padding: 10px; margin-top: 2px;
      color: #ccc; font-size: 11px;
      max-height: 350px; overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .ytls-settings-panel.open { display: block; }
    .ytls-settings-section {
      margin-bottom: 10px; padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }
    .ytls-settings-section:last-child { border-bottom: none; }
    .ytls-settings-title {
      font-size: 10px; color: #888; text-transform: uppercase;
      letter-spacing: 1px; margin-bottom: 6px;
    }
    .ytls-settings-row {
      display: flex; align-items: center;
      justify-content: space-between; margin: 4px 0;
    }
    .ytls-btn {
      background: #333; color: #ccc; border: 1px solid #555;
      border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 10px;
    }
    .ytls-btn:hover { background: #444; }
    .ytls-btn.active { background: #c42821; border-color: #e44; }
    .ytls-eq-container {
      display: flex; justify-content: space-around; align-items: flex-end;
      height: 100px; padding: 8px 0;
    }
    .ytls-eq-band { text-align: center; }
    .ytls-eq-slider {
      writing-mode: vertical-lr; direction: rtl;
      width: 20px; height: 70px; accent-color: #c42821;
    }
    .ytls-eq-label { font-size: 8px; color: #888; margin-top: 2px; }
    .ytls-bookmark-list { max-height: 120px; overflow-y: auto; margin-top: 4px; }
    .ytls-bookmark-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 3px 0; border-bottom: 1px solid #222;
    }
    .ytls-bookmark-name { color: #ccc; cursor: pointer; flex: 1; }
    .ytls-bookmark-name:hover { color: #ff4444; }
    .ytls-build-info { color: #555; font-size: 9px; text-align: center; margin-top: 8px; }
    .ytls-switch-toggle {
      width: 36px; height: 18px; border-radius: 9px;
      background: #333; border: 1px solid #555;
      position: relative; cursor: pointer; display: inline-block;
    }
    .ytls-switch-toggle.on { background: #c42821; }
    .ytls-switch-dot {
      width: 14px; height: 14px; border-radius: 50%;
      background: #ccc; position: absolute; top: 2px; left: 2px;
      transition: left 0.15s;
    }
    .ytls-switch-toggle.on .ytls-switch-dot { left: 20px; }
    .ytls-skin-grid {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 6px; padding: 4px 0;
    }
    .ytls-skin-swatch-wrap { text-align: center; }
    .ytls-skin-swatch {
      width: 100%; aspect-ratio: 1; border-radius: 6px;
      cursor: pointer; border: 2px solid transparent;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      transition: border-color 0.15s;
    }
    .ytls-skin-swatch:hover { border-color: rgba(255,255,255,0.4); }
    .ytls-skin-swatch.active {
      border-color: #fff;
      box-shadow: 0 0 6px rgba(255,255,255,0.4);
    }
    .ytls-skin-name {
      font-size: 7px; color: #888; margin-top: 2px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
  `;
  document.head.appendChild(style);
}

// --- Classes ---

class ParameterStore {
  constructor(video) {
    this.video = video;
    this.volume = 50;
    this.tempo = 50;
    this.pitchShift = 0;
    this.pitchEnabled = false;
    this.intervalId = null;
  }
  startContinuousApply() {
    this.applyCurrent();
    this.intervalId = setInterval(() => this.applyCurrent(), 500);
  }
  stopContinuousApply() {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }
  applyCurrent() {
    if (!this.video) return;
    const vol = clamp(this.volume / 100, 0, 1);
    const rate = tempoToRate(this.tempo);
    const preserve = !this.pitchEnabled;
    if (Math.abs(this.video.volume - vol) > 0.001) this.video.volume = vol;
    if (Math.abs(this.video.playbackRate - rate) > 0.001) this.video.playbackRate = rate;
    setPreservesPitch(this.video, preserve);
  }
  setVolume(val) { this.volume = clamp(val, 0, 100); this.applyCurrent(); }
  setTempo(val) { this.tempo = clamp(val, 0, 100); this.applyCurrent(); }
  setPitchShift(semitones) { this.pitchShift = clamp(semitones, -12, 12); }
  setPitchEnabled(enabled) { this.pitchEnabled = enabled; this.applyCurrent(); }
}

class HighQualityAudioEngine {
  constructor(video) {
    this.video = video;
    this.audioContext = null; this.source = null; this.eqFilters = [];
    this.tempoGainNode = null; this.compressor = null;
    this.gainNode = null; this.analyser = null;
    this.rateAnimationId = null; this.targetRate = 1.0; this.currentRate = 1.0;
  }
  setup() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.source = this.audioContext.createMediaElementSource(this.video);
      const eqFreqs = [60, 250, 1000, 4000, 16000];
      this.eqFilters = eqFreqs.map((freq, i) => {
        const f = this.audioContext.createBiquadFilter();
        f.type = i === 0 ? 'lowshelf' : i === eqFreqs.length - 1 ? 'highshelf' : 'peaking';
        f.frequency.value = freq; f.gain.value = 0; f.Q.value = 1; return f;
      });
      this.tempoGainNode = this.audioContext.createGain();
      this.tempoGainNode.gain.value = 1.0;
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24; this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4; this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      let prev = this.source;
      for (const f of this.eqFilters) { prev.connect(f); prev = f; }
      prev.connect(this.tempoGainNode);
      this.tempoGainNode.connect(this.compressor);
      this.compressor.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      debugLog('Audio engine setup complete');
    } catch (e) { debugLog('Audio engine setup failed:', e); }
  }
  setEQBand(index, gainValue) {
    if (this.eqFilters[index]) this.eqFilters[index].gain.value = clamp(gainValue, -12, 12);
  }
  smoothRateChange(targetRate) {
    this.targetRate = targetRate;
    if (!this.rateAnimationId) this._animateRate();
  }
  _animateRate() {
    const diff = this.targetRate - this.currentRate;
    if (Math.abs(diff) < 0.005) {
      this.currentRate = this.targetRate; this.video.playbackRate = this.targetRate;
      this.rateAnimationId = null; return;
    }
    this.currentRate += diff * 0.15; this.video.playbackRate = this.currentRate;
    this.rateAnimationId = requestAnimationFrame(() => this._animateRate());
  }
  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') this.audioContext.resume();
  }
  destroy() {
    if (this.rateAnimationId) cancelAnimationFrame(this.rateAnimationId);
    if (this.audioContext) this.audioContext.close().catch(() => {});
  }
}

class VideoLooper {
  constructor(video) {
    this.video = video; this.pointA = null; this.pointB = null;
    this.isLooping = false; this.crossfadeDuration = 0.03;
    this.crossfadeTimeout = null; this.audioContext = null; this.gainNode = null;
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
  }
  setAudioContext(audioContext, gainNode) { this.audioContext = audioContext; this.gainNode = gainNode; }
  getCompensatedTime(eventDelay = 0) { return Math.max(0, this.video.currentTime - eventDelay); }
  setPointA(eventDelay = 0) { this.pointA = this.getCompensatedTime(eventDelay); debugLog('Point A:', this.pointA); return this.pointA; }
  setPointB(eventDelay = 0) {
    this.pointB = this.getCompensatedTime(eventDelay);
    if (this.pointB <= this.pointA) { this.pointB = null; return null; }
    debugLog('Point B:', this.pointB); return this.pointB;
  }
  startLoop() {
    if (this.pointA == null || this.pointB == null) return false;
    this.isLooping = true; this.video.addEventListener('timeupdate', this._onTimeUpdate);
    this.video.currentTime = this.pointA; debugLog('Loop started'); return true;
  }
  stopLoop() {
    this.isLooping = false; this.video.removeEventListener('timeupdate', this._onTimeUpdate);
    if (this.crossfadeTimeout) { clearTimeout(this.crossfadeTimeout); this.crossfadeTimeout = null; }
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
    }
    debugLog('Loop stopped');
  }
  reset() { this.stopLoop(); this.pointA = null; this.pointB = null; }
  _onTimeUpdate() {
    if (this.pointA == null || this.pointB == null) return;
    const current = this.video.currentTime;
    if (current >= this.pointB - this.crossfadeDuration && current < this.pointB && !this.crossfadeTimeout) this._startCrossfade();
    if (current >= this.pointB) this.video.currentTime = this.pointA;
  }
  _startCrossfade() {
    const halfMs = (this.crossfadeDuration / 2) * 1000;
    if (!this.gainNode || !this.audioContext) {
      this.crossfadeTimeout = setTimeout(() => { this.crossfadeTimeout = null; if (this.isLooping) this.video.currentTime = this.pointA; }, halfMs);
      return;
    }
    const ctx = this.audioContext; const now = ctx.currentTime; const half = this.crossfadeDuration / 2;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(1.0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.0, now + half);
    this.crossfadeTimeout = setTimeout(() => {
      this.crossfadeTimeout = null; if (!this.isLooping) return;
      this.video.currentTime = this.pointA;
      const nowAfter = ctx.currentTime;
      this.gainNode.gain.cancelScheduledValues(nowAfter);
      this.gainNode.gain.setValueAtTime(0.0, nowAfter);
      this.gainNode.gain.linearRampToValueAtTime(1.0, nowAfter + half);
    }, halfMs);
  }
  jogPoint(point, delta) {
    if (point === 'A' && this.pointA != null) {
      this.pointA = Math.max(0, this.pointA + delta);
      if (this.isLooping) this.video.currentTime = this.pointA; return this.pointA;
    }
    if (point === 'B' && this.pointB != null) {
      this.pointB = Math.max(this.pointA + 0.1, this.pointB + delta); return this.pointB;
    }
    return null;
  }
  getLoopLength() {
    if (this.pointA != null && this.pointB != null) return this.pointB - this.pointA;
    return null;
  }
}

class LoopManipulator {
  constructor(looper) { this.looper = looper; }
  doubleLoopLength() { const l = this.looper; if (l.pointA == null || l.pointB == null) return; l.pointB += l.pointB - l.pointA; }
  halfLoopLength() { const l = this.looper; if (l.pointA == null || l.pointB == null) return; const len = l.pointB - l.pointA; if (len > 0.2) l.pointB = l.pointA + len / 2; }
  jumpSection(direction) {
    const l = this.looper; if (l.pointA == null || l.pointB == null) return;
    const len = l.pointB - l.pointA; l.pointA = Math.max(0, l.pointA + direction * len);
    l.pointB = l.pointA + len; if (l.isLooping) l.video.currentTime = l.pointA;
  }
}

class DigitalDisplay {
  constructor(svgElement) {
    this.svg = svgElement;
    this.line1 = svgElement.querySelector('.ytls-lcd-line1');
    this.line2 = svgElement.querySelector('.ytls-lcd-line2');
    this._persistent1 = ''; this._persistent2 = ''; this.messageTimeout = null;
  }
  update(text1, text2) { this._persistent1 = text1 || ''; this._persistent2 = text2 || ''; this._render(this._persistent1, this._persistent2); }
  _render(t1, t2) { if (this.line1) this.line1.textContent = t1; if (this.line2) this.line2.textContent = t2; }
  showTemporary(text1, text2, duration = 2000) {
    this._render(text1 || '', text2 || '');
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => { this._render(this._persistent1, this._persistent2); this.messageTimeout = null; }, duration);
  }
  showLoopInfo(pointA, pointB, state) {
    const a = formatTime(pointA); const b = formatTime(pointB);
    const stateText = state === 'play' ? 'LOOPING' : state === 'rec' ? 'SET B...' : 'READY';
    this.update(`A:${a}  B:${b}`, stateText);
  }
}

// --- Bookmark helpers ---

function getBookmarks() { try { return JSON.parse(localStorage.getItem('ytLoopStationBookmarks') || '[]'); } catch { return []; } }
function saveBookmarks(bms) { localStorage.setItem('ytLoopStationBookmarks', JSON.stringify(bms)); }
function applyBookmark(bm, looper, paramStore, display) {
  if (bm.pointA != null) looper.pointA = bm.pointA;
  if (bm.pointB != null) looper.pointB = bm.pointB;
  if (bm.volume != null) paramStore.setVolume(bm.volume);
  if (bm.tempo != null) paramStore.setTempo(bm.tempo);
  paramStore.applyCurrent();
  if (looper.pointA != null && looper.pointB != null) { looper.startLoop(); display.showLoopInfo(looper.pointA, looper.pointB, 'play'); }
}

// --- UI Builder ---

function buildLCD() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'ytls-lcd');
  svg.setAttribute('viewBox', '0 0 260 52');
  const defs = document.createElementNS(svgNS, 'defs');
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'ytls-glow');
  const blur = document.createElementNS(svgNS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '1'); blur.setAttribute('result', 'glow');
  const merge = document.createElementNS(svgNS, 'feMerge');
  const mn1 = document.createElementNS(svgNS, 'feMergeNode'); mn1.setAttribute('in', 'glow');
  const mn2 = document.createElementNS(svgNS, 'feMergeNode'); mn2.setAttribute('in', 'SourceGraphic');
  merge.appendChild(mn1); merge.appendChild(mn2);
  filter.appendChild(blur); filter.appendChild(merge); defs.appendChild(filter); svg.appendChild(defs);
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('width', '100%'); rect.setAttribute('height', '100%');
  rect.setAttribute('fill', '#1a0000'); rect.setAttribute('rx', '3'); svg.appendChild(rect);
  const line1 = document.createElementNS(svgNS, 'text');
  line1.setAttribute('class', 'ytls-lcd-text ytls-lcd-glow ytls-lcd-line1');
  line1.setAttribute('x', '8'); line1.setAttribute('y', '22');
  line1.textContent = 'YT LOOP STATION'; svg.appendChild(line1);
  const line2 = document.createElementNS(svgNS, 'text');
  line2.setAttribute('class', 'ytls-lcd-text ytls-lcd-glow ytls-lcd-line2');
  line2.setAttribute('x', '8'); line2.setAttribute('y', '42');
  line2.textContent = 'READY'; svg.appendChild(line2);
  return svg;
}

function buildKnob(label, initialValue) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const S = 64, C = S / 2;
  const el = (tag, attrs) => {
    const e = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    return e;
  };
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'ytls-knob'); svg.setAttribute('viewBox', `0 0 ${S} ${S}`);
  svg.dataset.value = initialValue;
  svg.appendChild(el('circle', { cx: C, cy: C, r: 30, fill: '#333030' }));
  svg.appendChild(el('path', { d: knurledPath(C, C, 27, 24), fill: '#4D494D' }));
  svg.appendChild(el('circle', { cx: C, cy: C, r: 18, class: 'ytls-knob-face' }));
  const bfly = butterflyPaths(C, C, 13);
  svg.appendChild(el('path', { d: bfly[0], fill: '#fff', opacity: '0.4' }));
  svg.appendChild(el('path', { d: bfly[1], fill: '#fff', opacity: '0.4' }));
  const angle = ((initialValue / 100) * 270) - 135;
  const indicator = el('line', {
    x1: C, y1: C - 6, x2: C, y2: C - 26,
    stroke: '#4D494D', 'stroke-width': '4', 'stroke-linecap': 'round',
    transform: `rotate(${angle} ${C} ${C})`
  });
  svg.appendChild(indicator);
  const lbl = document.createElement('div');
  lbl.className = 'ytls-knob-label'; lbl.textContent = label;
  return { svg, indicator, label: lbl };
}

function buildToggle(label) {
  const group = document.createElement('div'); group.className = 'ytls-toggle-group';
  const track = document.createElement('div'); track.className = 'ytls-toggle-track';
  const handle = document.createElement('div'); handle.className = 'ytls-toggle-handle';
  track.appendChild(handle);
  const lbl = document.createElement('div'); lbl.className = 'ytls-toggle-label'; lbl.textContent = label;
  group.appendChild(track); group.appendChild(lbl);
  return { element: group, track, handle };
}

function buildSettingsToggle(label, initialOn) {
  const row = document.createElement('div'); row.className = 'ytls-settings-row';
  const span = document.createElement('span'); span.textContent = label;
  const toggle = document.createElement('div');
  toggle.className = 'ytls-switch-toggle' + (initialOn ? ' on' : '');
  const dot = document.createElement('div'); dot.className = 'ytls-switch-dot';
  toggle.appendChild(dot); row.appendChild(span); row.appendChild(toggle);
  return { element: row, toggle };
}

function buildEQSlider(freq, onChange) {
  const band = document.createElement('div'); band.className = 'ytls-eq-band';
  const slider = document.createElement('input');
  slider.type = 'range'; slider.min = '-12'; slider.max = '12'; slider.value = '0'; slider.step = '1';
  slider.className = 'ytls-eq-slider';
  slider.addEventListener('input', () => onChange(parseFloat(slider.value)));
  const label = document.createElement('div'); label.className = 'ytls-eq-label'; label.textContent = freq;
  band.appendChild(slider); band.appendChild(label); return band;
}

function applySkinToUI(pedal, svgContainer, skinId) {
  const skin = SKINS[skinId] || SKINS.bd2;
  svgContainer.innerHTML = skin.svg();
  pedal.style.setProperty('--knob-face', skin.knobFace);
  pedal.style.setProperty('--text-color', skin.textColor);
}

function buildPedalUI() {
  const pedal = document.createElement('div');
  pedal.className = 'ytls-pedal'; pedal.id = 'yt-loop-station';

  // Skin layer - contains SVG container + controls overlay
  const skinLayer = document.createElement('div');
  skinLayer.className = 'ytls-skin-layer';

  // SVG container - holds the Boss pedal SVG artwork
  const svgContainer = document.createElement('div');
  svgContainer.className = 'ytls-svg-container';

  // Controls overlay - sits on top of the SVG
  const overlay = document.createElement('div');
  overlay.className = 'ytls-overlay';

  const closeBtn = document.createElement('div');
  closeBtn.className = 'ytls-close-btn'; closeBtn.textContent = '\u00d7';
  overlay.appendChild(closeBtn);

  const settingsBtn = document.createElement('div');
  settingsBtn.className = 'ytls-settings-btn'; settingsBtn.textContent = '\u2699';
  overlay.appendChild(settingsBtn);

  // Drag zone
  const dragZone = document.createElement('div'); dragZone.className = 'ytls-drag-zone';
  for (let i = 0; i < 5; i++) { const d = document.createElement('div'); d.className = 'ytls-drag-dot'; dragZone.appendChild(d); }
  overlay.appendChild(dragZone);

  // LCD
  const lcdWrap = document.createElement('div'); lcdWrap.className = 'ytls-lcd-wrap';
  const lcd = buildLCD(); lcdWrap.appendChild(lcd);
  overlay.appendChild(lcdWrap);

  // LED
  const led = document.createElement('div'); led.className = 'ytls-led';
  overlay.appendChild(led);

  // Knobs
  const volKnob = buildKnob('VOL', 50);
  const tempoKnob = buildKnob('TEMPO', 50);

  const knobLeft = document.createElement('div'); knobLeft.className = 'ytls-knob-left';
  knobLeft.appendChild(volKnob.svg); knobLeft.appendChild(volKnob.label);
  overlay.appendChild(knobLeft);

  const knobRight = document.createElement('div'); knobRight.className = 'ytls-knob-right';
  knobRight.appendChild(tempoKnob.svg); knobRight.appendChild(tempoKnob.label);
  overlay.appendChild(knobRight);

  // Mid section: toggles + logo
  const mid = document.createElement('div'); mid.className = 'ytls-mid-section';

  const togglesGrid = document.createElement('div'); togglesGrid.className = 'ytls-toggles-grid';
  const jogA = buildToggle('JOG A'); const jogB = buildToggle('JOG B');
  const section = buildToggle('SECTION'); const length = buildToggle('LENGTH');
  togglesGrid.appendChild(jogA.element); togglesGrid.appendChild(jogB.element);
  togglesGrid.appendChild(section.element); togglesGrid.appendChild(length.element);
  mid.appendChild(togglesGrid);

  const logoSection = document.createElement('div'); logoSection.className = 'ytls-logo-section';
  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('loop-station-text.png'); logo.alt = 'YT Loop Station';
  logoSection.appendChild(logo);
  mid.appendChild(logoSection);

  overlay.appendChild(mid);

  // Footswitch
  const footWrap = document.createElement('div'); footWrap.className = 'ytls-footswitch-wrap';
  const footswitch = document.createElement('div');
  footswitch.className = 'ytls-footswitch'; footswitch.textContent = 'REC';
  footWrap.appendChild(footswitch);
  overlay.appendChild(footWrap);

  // Assemble: SVG container + overlay inside skin layer
  skinLayer.appendChild(svgContainer);
  skinLayer.appendChild(overlay);
  pedal.appendChild(skinLayer);

  // Settings panel (below pedal)
  const settings = document.createElement('div');
  settings.className = 'ytls-settings-panel';
  pedal.appendChild(settings);

  // Apply initial skin
  applySkinToUI(pedal, svgContainer, getSavedSkin());

  return {
    pedal, svgContainer, closeBtn, settingsBtn, dragZone, lcd, settings, led,
    volKnob: { knob: volKnob.svg, indicator: volKnob.indicator },
    tempoKnob: { knob: tempoKnob.svg, indicator: tempoKnob.indicator },
    footswitch,
    toggles: { jogA, jogB, section, length }
  };
}

function buildSettingsContent(settings, pedal, svgContainer, audioEngine, looper, paramStore, display, refreshBookmarks) {
  settings.innerHTML = '';

  // Skin selector
  const skinSection = document.createElement('div'); skinSection.className = 'ytls-settings-section';
  const skinTitle = document.createElement('div');
  skinTitle.className = 'ytls-settings-title'; skinTitle.textContent = 'SKIN';
  skinSection.appendChild(skinTitle);
  const skinGrid = document.createElement('div'); skinGrid.className = 'ytls-skin-grid';
  const currentSkin = getSavedSkin();
  Object.entries(SKINS).forEach(([id, skin]) => {
    const wrap = document.createElement('div'); wrap.className = 'ytls-skin-swatch-wrap';
    const swatch = document.createElement('div');
    swatch.className = 'ytls-skin-swatch' + (id === currentSkin ? ' active' : '');
    swatch.style.background = skin.swatchColor; swatch.title = skin.name;
    swatch.addEventListener('click', () => {
      skinGrid.querySelectorAll('.ytls-skin-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      applySkinToUI(pedal, svgContainer, id);
      saveSkin(id);
    });
    const name = document.createElement('div'); name.className = 'ytls-skin-name'; name.textContent = skin.name;
    wrap.appendChild(swatch); wrap.appendChild(name); skinGrid.appendChild(wrap);
  });
  skinSection.appendChild(skinGrid); settings.appendChild(skinSection);

  // Scale toggle
  const scaleSection = document.createElement('div'); scaleSection.className = 'ytls-settings-section';
  const scaleToggle = buildSettingsToggle('Scale +25%', false);
  scaleSection.appendChild(scaleToggle.element); settings.appendChild(scaleSection);

  // EQ
  const eqSection = document.createElement('div'); eqSection.className = 'ytls-settings-section';
  const eqTitle = document.createElement('div');
  eqTitle.className = 'ytls-settings-title'; eqTitle.textContent = 'EQUALIZER';
  eqSection.appendChild(eqTitle);
  const eqContainer = document.createElement('div'); eqContainer.className = 'ytls-eq-container';
  ['60', '250', '1k', '4k', '16k'].forEach((freq, i) => {
    eqContainer.appendChild(buildEQSlider(freq, (val) => {
      audioEngine.setEQBand(i, val);
      display.showTemporary('EQ', `${freq}Hz: ${val > 0 ? '+' : ''}${val}dB`);
    }));
  });
  eqSection.appendChild(eqContainer); settings.appendChild(eqSection);

  // Bookmarks
  const bmSection = document.createElement('div'); bmSection.className = 'ytls-settings-section';
  const bmTitle = document.createElement('div');
  bmTitle.className = 'ytls-settings-title'; bmTitle.textContent = 'BOOKMARKS';
  bmSection.appendChild(bmTitle);
  const bmSaveBtn = document.createElement('button');
  bmSaveBtn.className = 'ytls-btn'; bmSaveBtn.textContent = 'Save Bookmark';
  bmSaveBtn.addEventListener('click', () => {
    const name = prompt('Bookmark name:'); if (!name) return;
    const bookmarks = getBookmarks();
    bookmarks.push({ name, url: window.location.href, pointA: looper.pointA, pointB: looper.pointB, volume: paramStore.volume, tempo: paramStore.tempo, timestamp: Date.now() });
    saveBookmarks(bookmarks); refreshBookmarks(); display.showTemporary('SAVED', name);
  });
  bmSection.appendChild(bmSaveBtn);
  const bmList = document.createElement('div'); bmList.className = 'ytls-bookmark-list';
  bmSection.appendChild(bmList); settings.appendChild(bmSection);

  const buildInfo = document.createElement('div');
  buildInfo.className = 'ytls-build-info';
  buildInfo.textContent = 'YT Loop Station v2.0 \u2022 Boss SVG Tribute Skins';
  settings.appendChild(buildInfo);

  return { scaleToggle: scaleToggle.toggle, bmList };
}

// --- Main creation function ---

let activeCleanup = null;
const PENDING_BM_KEY = 'ytLoopStationPendingBookmark';

function createLoopStation(video) {
  if (!video || document.getElementById('yt-loop-station')) return;
  debugLog('Creating loop station');
  injectStyles();

  const paramStore = new ParameterStore(video);
  const audioEngine = new HighQualityAudioEngine(video);
  audioEngine.setup();
  const looper = new VideoLooper(video);
  looper.setAudioContext(audioEngine.audioContext, audioEngine.gainNode);
  const manipulator = new LoopManipulator(looper);

  const ui = buildPedalUI();
  const display = new DigitalDisplay(ui.lcd);

  const listeners = [];
  function addListener(el, event, handler, opts) {
    el.addEventListener(event, handler, opts); listeners.push({ el, event, handler, opts });
  }

  function refreshBookmarks() {
    const bookmarks = getBookmarks();
    settingsUI.bmList.innerHTML = '';
    bookmarks.forEach((bm, i) => {
      const item = document.createElement('div'); item.className = 'ytls-bookmark-item';
      const name = document.createElement('span'); name.className = 'ytls-bookmark-name';
      name.textContent = bm.name; name.addEventListener('click', () => activateBookmark(bm));
      const delBtn = document.createElement('button'); delBtn.className = 'ytls-btn'; delBtn.textContent = '\u00d7';
      delBtn.addEventListener('click', () => { const bms = getBookmarks(); bms.splice(i, 1); saveBookmarks(bms); refreshBookmarks(); });
      item.appendChild(name); item.appendChild(delBtn); settingsUI.bmList.appendChild(item);
    });
  }

  const settingsUI = buildSettingsContent(
    ui.settings, ui.pedal, ui.svgContainer, audioEngine, looper, paramStore, display, refreshBookmarks
  );
  refreshBookmarks();

  const KC = 32; // knob center (64/2)
  function updateKnobVisual(knobObj, value) {
    const angle = ((value / 100) * 270) - 135;
    knobObj.indicator.setAttribute('transform', `rotate(${angle} ${KC} ${KC})`);
    knobObj.knob.dataset.value = value;
  }

  function setupKnobDrag(knobObj, onChange) {
    let dragging = false, startY = 0, startVal = 0;
    addListener(knobObj.knob, 'mousedown', (e) => {
      e.preventDefault(); dragging = true; startY = e.clientY;
      startVal = parseFloat(knobObj.knob.dataset.value); audioEngine.resumeContext();
    });
    addListener(document, 'mousemove', (e) => {
      if (!dragging) return;
      const newVal = clamp(Math.round(startVal + (startY - e.clientY) * 0.5), 0, 100);
      updateKnobVisual(knobObj, newVal); onChange(newVal);
    });
    addListener(document, 'mouseup', () => { dragging = false; });
  }

  setupKnobDrag(ui.volKnob, (val) => { paramStore.setVolume(val); display.showTemporary('VOLUME', `${val}%`); });
  setupKnobDrag(ui.tempoKnob, (val) => {
    paramStore.setTempo(val); const rate = tempoToRate(val);
    audioEngine.smoothRateChange(rate); display.showTemporary('TEMPO', `${val}% (${rate.toFixed(2)}x)`);
  });

  function setupToggle(toggleObj, onLeft, onRight) {
    addListener(toggleObj.track, 'mousedown', (e) => {
      const rect = toggleObj.track.getBoundingClientRect();
      const isLeft = e.clientX < rect.left + rect.width / 2;
      toggleObj.handle.classList.add(isLeft ? 'left' : 'right');
      if (isLeft) onLeft(); else onRight();
    });
    addListener(toggleObj.track, 'mouseup', () => { toggleObj.handle.classList.remove('left', 'right'); });
    addListener(toggleObj.track, 'mouseleave', () => { toggleObj.handle.classList.remove('left', 'right'); });
  }

  setupToggle(ui.toggles.jogA,
    () => { const v = looper.jogPoint('A', -0.05); if (v != null) display.showTemporary('JOG A', formatTime(v)); },
    () => { const v = looper.jogPoint('A', 0.05); if (v != null) display.showTemporary('JOG A', formatTime(v)); });
  setupToggle(ui.toggles.jogB,
    () => { const v = looper.jogPoint('B', -0.05); if (v != null) display.showTemporary('JOG B', formatTime(v)); },
    () => { const v = looper.jogPoint('B', 0.05); if (v != null) display.showTemporary('JOG B', formatTime(v)); });
  setupToggle(ui.toggles.section,
    () => { manipulator.jumpSection(-1); display.showTemporary('SECTION', '\u2190 PREV'); },
    () => { manipulator.jumpSection(1); display.showTemporary('SECTION', 'NEXT \u2192'); });
  setupToggle(ui.toggles.length,
    () => { manipulator.halfLoopLength(); const l = looper.getLoopLength(); display.showTemporary('LENGTH', l ? `\u00f72 = ${l.toFixed(2)}s` : '\u00f72'); },
    () => { manipulator.doubleLoopLength(); const l = looper.getLoopLength(); display.showTemporary('LENGTH', l ? `\u00d72 = ${l.toFixed(2)}s` : '\u00d72'); });

  let footState = 0, resetTimeout = null;

  function updateFootswitch() {
    ui.footswitch.classList.remove('rec', 'play');
    ui.led.classList.remove('on');
    if (footState === 0) { ui.footswitch.textContent = 'REC'; }
    else if (footState === 1) { ui.footswitch.textContent = 'REC'; ui.footswitch.classList.add('rec'); ui.led.classList.add('on'); }
    else { ui.footswitch.textContent = 'PLAY'; ui.footswitch.classList.add('play'); ui.led.classList.add('on'); }
  }

  function getVideoId(url) { try { return new URL(url).searchParams.get('v'); } catch { return null; } }

  function activateBookmark(bm) {
    const targetId = bm.url ? getVideoId(bm.url) : null;
    const currentId = getVideoId(window.location.href);
    if (targetId && currentId !== targetId) {
      localStorage.setItem(PENDING_BM_KEY, JSON.stringify(bm));
      display.showTemporary('LOADING', bm.name || 'BOOKMARK'); window.location.href = bm.url; return;
    }
    applyBookmark(bm, looper, paramStore, display);
    updateKnobVisual(ui.volKnob, paramStore.volume);
    updateKnobVisual(ui.tempoKnob, paramStore.tempo);
    footState = 2; updateFootswitch();
  }

  function doFootswitchAction(eventDelay = 0) {
    audioEngine.resumeContext();
    if (resetTimeout) { clearTimeout(resetTimeout); resetTimeout = null; }
    if (footState === 0) {
      const a = looper.setPointA(eventDelay); display.showLoopInfo(a, null, 'rec'); footState = 1;
    } else if (footState === 1) {
      const b = looper.setPointB(eventDelay);
      if (b != null) { looper.startLoop(); display.showLoopInfo(looper.pointA, looper.pointB, 'play'); footState = 2; }
      else { display.showTemporary('ERROR', 'B must be after A'); }
    } else {
      looper.stopLoop(); display.update('STOPPED', ''); footState = 0;
      resetTimeout = setTimeout(() => { resetTimeout = null; if (footState === 0) { looper.reset(); display.update('YT LOOP STATION', 'READY'); } }, 2000);
    }
    updateFootswitch();
  }

  addListener(ui.footswitch, 'pointerdown', (e) => {
    e.preventDefault(); doFootswitchAction(Math.max(0, (performance.now() - e.timeStamp) / 1000));
  });
  addListener(document, 'keydown', (e) => {
    if (e.key !== '\\') return;
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault(); e.stopPropagation();
    doFootswitchAction(Math.max(0, (performance.now() - e.timeStamp) / 1000));
  });

  let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
  addListener(ui.dragZone, 'mousedown', (e) => {
    isDragging = true; const rect = ui.pedal.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left; dragOffsetY = e.clientY - rect.top;
    ui.dragZone.style.cursor = 'grabbing';
  });
  addListener(document, 'mousemove', (e) => {
    if (!isDragging) return;
    ui.pedal.style.left = (e.clientX - dragOffsetX) + 'px';
    ui.pedal.style.top = (e.clientY - dragOffsetY) + 'px';
    ui.pedal.style.right = 'auto';
  });
  addListener(document, 'mouseup', () => { if (isDragging) { isDragging = false; ui.dragZone.style.cursor = 'grab'; } });

  addListener(ui.settingsBtn, 'click', () => { ui.settings.classList.toggle('open'); });
  addListener(settingsUI.scaleToggle, 'click', () => {
    settingsUI.scaleToggle.classList.toggle('on');
    ui.pedal.classList.toggle('ytls-scaled', settingsUI.scaleToggle.classList.contains('on'));
  });

  function cleanup() {
    if (resetTimeout) clearTimeout(resetTimeout);
    paramStore.stopContinuousApply(); looper.stopLoop(); audioEngine.destroy();
    listeners.forEach(({ el, event, handler, opts }) => el.removeEventListener(event, handler, opts));
    ui.pedal.remove(); activeCleanup = null;
  }

  addListener(ui.closeBtn, 'click', cleanup);
  paramStore.startContinuousApply();
  document.body.appendChild(ui.pedal);

  const pending = localStorage.getItem(PENDING_BM_KEY);
  if (pending) {
    localStorage.removeItem(PENDING_BM_KEY);
    try { setTimeout(() => activateBookmark(JSON.parse(pending)), 500); } catch (e) { debugLog('Pending bookmark error:', e); }
  }

  activeCleanup = cleanup;
  debugLog('Loop station created');
  return cleanup;
}

// --- Observer & Message Listener ---

function findVideoAndCreate(retries = 10) {
  const video = document.querySelector('video');
  if (video) { createLoopStation(video); return; }
  if (retries > 0) setTimeout(() => findVideoAndCreate(retries - 1), 200);
  else debugLog('No video element found');
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggle_pedal') {
    if (activeCleanup) activeCleanup(); else findVideoAndCreate();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { if (localStorage.getItem(PENDING_BM_KEY)) findVideoAndCreate(); });
} else {
  if (localStorage.getItem(PENDING_BM_KEY)) findVideoAndCreate();
}
