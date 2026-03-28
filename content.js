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

// --- CSS Injection ---

function injectStyles() {
  if (document.getElementById('yt-loop-station-styles')) return;
  const style = document.createElement('style');
  style.id = 'yt-loop-station-styles';
  style.textContent = `
    .ytls-pedal {
      position: fixed; top: 10px; right: 10px; z-index: 999999;
      width: 300px; font-family: 'Arial', sans-serif;
      transform: scale(0.7); transform-origin: top right;
      user-select: none; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      background: #c42821; padding: 8px; cursor: default;
    }
    .ytls-pedal.ytls-scaled { transform: scale(0.95); transform-origin: top right; }
    .ytls-drag-bar {
      height: 20px; background: linear-gradient(to bottom, #d44, #a22);
      border-radius: 12px 12px 0 0; cursor: grab;
      display: flex; align-items: center; justify-content: center;
    }
    .ytls-drag-bar-dots {
      display: flex; gap: 3px;
    }
    .ytls-drag-dot {
      width: 4px; height: 4px; border-radius: 50%;
      background: rgba(255,255,255,0.4);
    }
    .ytls-close-btn {
      position: absolute; top: -6px; right: -6px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #e33; border: 2px solid #fff;
      color: #fff; font-size: 12px; line-height: 20px;
      text-align: center; cursor: pointer; z-index: 10;
      font-weight: bold;
    }
    .ytls-close-btn:hover { background: #f55; }
    .ytls-hamburger {
      position: absolute; top: 2px; left: 14px;
      width: 24px; height: 20px; cursor: pointer; z-index: 10;
      display: flex; flex-direction: column; justify-content: center;
      align-items: center; gap: 3px;
    }
    .ytls-hamburger-line {
      width: 16px; height: 2px; background: rgba(255,255,255,0.7);
      border-radius: 1px;
    }
    .ytls-control-panel {
      background: linear-gradient(to bottom, #1a1a1a, #111);
      border-radius: 8px; padding: 12px; margin-top: 4px;
    }
    .ytls-lcd {
      width: 100%; height: 60px; border-radius: 4px;
      background: #1a0000; border: 1px solid #333;
    }
    .ytls-lcd-text { fill: #ff3333; font-family: monospace; font-size: 13px; }
    .ytls-lcd-glow { filter: url(#ytls-glow); }
    .ytls-knobs-row {
      display: flex; justify-content: space-around;
      margin-top: 12px;
    }
    .ytls-knob-group { text-align: center; }
    .ytls-knob {
      width: 60px; height: 60px; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #555, #222);
      border: 2px solid #444; cursor: ns-resize; position: relative;
      margin: 0 auto;
    }
    .ytls-knob-indicator {
      position: absolute; bottom: 6px; left: 50%;
      width: 3px; height: 14px; background: #ff4444;
      border-radius: 1px; transform-origin: bottom center;
    }
    .ytls-knob-label {
      color: #999; font-size: 10px; margin-top: 4px;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .ytls-toggles-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; margin-top: 12px;
    }
    .ytls-toggle-group { text-align: center; }
    .ytls-toggle-track {
      width: 40px; height: 18px; background: #333;
      border-radius: 9px; margin: 0 auto; position: relative;
      cursor: pointer; border: 1px solid #555;
    }
    .ytls-toggle-handle {
      width: 14px; height: 14px; background: #ccc;
      border-radius: 50%; position: absolute;
      top: 2px; left: 13px; transition: left 0.1s;
    }
    .ytls-toggle-handle.left { left: 2px; }
    .ytls-toggle-handle.right { left: 24px; }
    .ytls-toggle-label {
      color: #999; font-size: 9px; margin-top: 3px;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .ytls-logo-section {
      text-align: center; padding: 6px 0;
    }
    .ytls-logo-section img {
      height: 30px; opacity: 0.9;
    }
    .ytls-footswitch-area {
      padding: 8px;
    }
    .ytls-footswitch {
      width: 100%; height: 60px; border-radius: 8px;
      background: linear-gradient(to bottom, #444, #222);
      border: 2px solid #555; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #999; font-size: 14px; font-weight: bold;
      letter-spacing: 2px; text-transform: uppercase;
      transition: background 0.15s;
    }
    .ytls-footswitch:active { background: linear-gradient(to bottom, #333, #111); }
    .ytls-footswitch.rec { color: #ff4444; }
    .ytls-footswitch.play { color: #44ff44; }
    .ytls-settings-panel {
      display: none; background: #111; border-radius: 8px;
      padding: 12px; margin-top: 4px; color: #ccc;
      font-size: 11px; max-height: 400px; overflow-y: auto;
    }
    .ytls-settings-panel.open { display: block; }
    .ytls-settings-section {
      margin-bottom: 12px; padding-bottom: 8px;
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
      border-radius: 4px; padding: 4px 8px; cursor: pointer;
      font-size: 10px;
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
    .ytls-pitch-section { text-align: center; }
    .ytls-pitch-display {
      font-family: monospace; font-size: 16px; color: #ff4444;
      margin: 4px 0;
    }
    .ytls-pitch-slider {
      width: 80%; accent-color: #c42821;
    }
    .ytls-pitch-btns { display: flex; justify-content: center; gap: 4px; margin-top: 4px; }
    .ytls-bookmark-list {
      max-height: 120px; overflow-y: auto; margin-top: 4px;
    }
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
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
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

  setVolume(val) {
    this.volume = clamp(val, 0, 100);
    this.applyCurrent();
  }

  setTempo(val) {
    this.tempo = clamp(val, 0, 100);
    this.applyCurrent();
  }

  setPitchShift(semitones) {
    this.pitchShift = clamp(semitones, -12, 12);
  }

  setPitchEnabled(enabled) {
    this.pitchEnabled = enabled;
    this.applyCurrent();
  }
}

class HighQualityAudioEngine {
  constructor(video) {
    this.video = video;
    this.audioContext = null;
    this.source = null;
    this.eqFilters = [];
    this.tempoGainNode = null;
    this.compressor = null;
    this.gainNode = null;
    this.analyser = null;
    this.rateAnimationId = null;
    this.targetRate = 1.0;
    this.currentRate = 1.0;
  }

  setup() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.source = this.audioContext.createMediaElementSource(this.video);

      const eqFreqs = [60, 250, 1000, 4000, 16000];
      this.eqFilters = eqFreqs.map((freq, i) => {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = i === 0 ? 'lowshelf' : i === eqFreqs.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.gain.value = 0;
        filter.Q.value = 1;
        return filter;
      });

      this.tempoGainNode = this.audioContext.createGain();
      this.tempoGainNode.gain.value = 1.0;

      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      let prev = this.source;
      for (const filter of this.eqFilters) {
        prev.connect(filter);
        prev = filter;
      }
      prev.connect(this.tempoGainNode);
      this.tempoGainNode.connect(this.compressor);
      this.compressor.connect(this.gainNode);
      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      debugLog('Audio engine setup complete');
    } catch (e) {
      debugLog('Audio engine setup failed:', e);
    }
  }

  setEQBand(index, gainValue) {
    if (this.eqFilters[index]) {
      this.eqFilters[index].gain.value = clamp(gainValue, -12, 12);
    }
  }

  smoothRateChange(targetRate) {
    this.targetRate = targetRate;
    if (!this.rateAnimationId) this._animateRate();
  }

  _animateRate() {
    const diff = this.targetRate - this.currentRate;
    if (Math.abs(diff) < 0.005) {
      this.currentRate = this.targetRate;
      this.video.playbackRate = this.targetRate;
      this.rateAnimationId = null;
      return;
    }
    this.currentRate += diff * 0.15;
    this.video.playbackRate = this.currentRate;
    this.rateAnimationId = requestAnimationFrame(() => this._animateRate());
  }

  resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  destroy() {
    if (this.rateAnimationId) cancelAnimationFrame(this.rateAnimationId);
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
    }
  }
}

class VideoLooper {
  constructor(video) {
    this.video = video;
    this.pointA = null;
    this.pointB = null;
    this.isLooping = false;
    this.crossfadeDuration = 0.03;
    this.crossfadeTimeout = null;
    this.latencyCompensation = 0.15;
    this.latencyEnabled = true;
    this.audioContext = null;
    this.gainNode = null;
    this._onTimeUpdate = this._onTimeUpdate.bind(this);
  }

  setAudioContext(audioContext, gainNode) {
    this.audioContext = audioContext;
    this.gainNode = gainNode;
  }

  getCompensatedTime() {
    const raw = this.video.currentTime;
    return this.latencyEnabled ? Math.max(0, raw - this.latencyCompensation) : raw;
  }

  setPointA() {
    this.pointA = this.getCompensatedTime();
    debugLog('Point A set:', this.pointA);
    return this.pointA;
  }

  setPointB() {
    this.pointB = this.getCompensatedTime();
    if (this.pointB <= this.pointA) {
      this.pointB = null;
      return null;
    }
    debugLog('Point B set:', this.pointB);
    return this.pointB;
  }

  startLoop() {
    if (this.pointA == null || this.pointB == null) return false;
    this.isLooping = true;
    this.video.addEventListener('timeupdate', this._onTimeUpdate);
    this.video.currentTime = this.pointA;
    debugLog('Loop started:', this.pointA, '→', this.pointB);
    return true;
  }

  stopLoop() {
    this.isLooping = false;
    this.video.removeEventListener('timeupdate', this._onTimeUpdate);
    if (this.crossfadeTimeout) {
      clearTimeout(this.crossfadeTimeout);
      this.crossfadeTimeout = null;
    }
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
    }
    debugLog('Loop stopped');
  }

  reset() {
    this.stopLoop();
    this.pointA = null;
    this.pointB = null;
  }

  _onTimeUpdate() {
    if (this.pointA == null || this.pointB == null) return;
    const current = this.video.currentTime;
    const fadeStart = this.pointB - this.crossfadeDuration;

    if (current >= fadeStart && current < this.pointB && !this.crossfadeTimeout) {
      this._startCrossfade();
    }
    if (current >= this.pointB) {
      this.video.currentTime = this.pointA;
    }
  }

  _startCrossfade() {
    const halfMs = (this.crossfadeDuration / 2) * 1000;

    if (!this.gainNode || !this.audioContext) {
      this.crossfadeTimeout = setTimeout(() => {
        this.crossfadeTimeout = null;
        if (!this.isLooping) return;
        this.video.currentTime = this.pointA;
      }, halfMs);
      return;
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const half = this.crossfadeDuration / 2;

    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(1.0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.0, now + half);

    this.crossfadeTimeout = setTimeout(() => {
      this.crossfadeTimeout = null;
      if (!this.isLooping) return;
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
      if (this.isLooping) this.video.currentTime = this.pointA;
      return this.pointA;
    }
    if (point === 'B' && this.pointB != null) {
      this.pointB = Math.max(this.pointA + 0.1, this.pointB + delta);
      return this.pointB;
    }
    return null;
  }

  getLoopLength() {
    if (this.pointA != null && this.pointB != null) return this.pointB - this.pointA;
    return null;
  }
}

class LoopManipulator {
  constructor(looper) {
    this.looper = looper;
  }

  doubleLoopLength() {
    const l = this.looper;
    if (l.pointA == null || l.pointB == null) return;
    const len = l.pointB - l.pointA;
    l.pointB = l.pointB + len;
    debugLog('Loop doubled:', l.pointA, '→', l.pointB);
  }

  halfLoopLength() {
    const l = this.looper;
    if (l.pointA == null || l.pointB == null) return;
    const len = l.pointB - l.pointA;
    if (len > 0.2) {
      l.pointB = l.pointA + len / 2;
      debugLog('Loop halved:', l.pointA, '→', l.pointB);
    }
  }

  jumpSection(direction) {
    const l = this.looper;
    if (l.pointA == null || l.pointB == null) return;
    const len = l.pointB - l.pointA;
    const shift = direction * len;
    l.pointA = Math.max(0, l.pointA + shift);
    l.pointB = l.pointA + len;
    if (l.isLooping) l.video.currentTime = l.pointA;
    debugLog('Section jumped:', l.pointA, '→', l.pointB);
  }
}

class DigitalDisplay {
  constructor(svgElement) {
    this.svg = svgElement;
    this.line1 = svgElement.querySelector('.ytls-lcd-line1');
    this.line2 = svgElement.querySelector('.ytls-lcd-line2');
    this._persistent1 = '';
    this._persistent2 = '';
    this.messageTimeout = null;
  }

  update(text1, text2) {
    this._persistent1 = text1 || '';
    this._persistent2 = text2 || '';
    this._render(this._persistent1, this._persistent2);
  }

  _render(t1, t2) {
    if (this.line1) this.line1.textContent = t1;
    if (this.line2) this.line2.textContent = t2;
  }

  showTemporary(text1, text2, duration = 2000) {
    this._render(text1 || '', text2 || '');
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => {
      this._render(this._persistent1, this._persistent2);
      this.messageTimeout = null;
    }, duration);
  }

  showLoopInfo(pointA, pointB, state) {
    const a = formatTime(pointA);
    const b = formatTime(pointB);
    const stateText = state === 'play' ? 'LOOPING' : state === 'rec' ? 'SET B...' : 'READY';
    this.update(`A:${a}  B:${b}`, stateText);
  }
}

// --- Bookmark helpers ---

function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem('ytLoopStationBookmarks') || '[]');
  } catch { return []; }
}

function saveBookmarks(bookmarks) {
  localStorage.setItem('ytLoopStationBookmarks', JSON.stringify(bookmarks));
}

function applyBookmark(bm, looper, paramStore, display) {
  if (bm.pointA != null) looper.pointA = bm.pointA;
  if (bm.pointB != null) looper.pointB = bm.pointB;
  if (bm.volume != null) paramStore.setVolume(bm.volume);
  if (bm.tempo != null) paramStore.setTempo(bm.tempo);
  paramStore.applyCurrent();
  if (looper.pointA != null && looper.pointB != null) {
    looper.startLoop();
    display.showLoopInfo(looper.pointA, looper.pointB, 'play');
  }
  debugLog('Bookmark applied:', bm);
}

// --- UI Builder ---

function buildLCD() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'ytls-lcd');
  svg.setAttribute('viewBox', '0 0 276 60');

  const defs = document.createElementNS(svgNS, 'defs');
  const filter = document.createElementNS(svgNS, 'filter');
  filter.setAttribute('id', 'ytls-glow');
  const blur = document.createElementNS(svgNS, 'feGaussianBlur');
  blur.setAttribute('stdDeviation', '1');
  blur.setAttribute('result', 'glow');
  const merge = document.createElementNS(svgNS, 'feMerge');
  const mn1 = document.createElementNS(svgNS, 'feMergeNode');
  mn1.setAttribute('in', 'glow');
  const mn2 = document.createElementNS(svgNS, 'feMergeNode');
  mn2.setAttribute('in', 'SourceGraphic');
  merge.appendChild(mn1);
  merge.appendChild(mn2);
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('width', '100%');
  rect.setAttribute('height', '100%');
  rect.setAttribute('fill', '#1a0000');
  rect.setAttribute('rx', '4');
  svg.appendChild(rect);

  const line1 = document.createElementNS(svgNS, 'text');
  line1.setAttribute('class', 'ytls-lcd-text ytls-lcd-glow ytls-lcd-line1');
  line1.setAttribute('x', '10');
  line1.setAttribute('y', '25');
  line1.textContent = 'YT LOOP STATION';
  svg.appendChild(line1);

  const line2 = document.createElementNS(svgNS, 'text');
  line2.setAttribute('class', 'ytls-lcd-text ytls-lcd-glow ytls-lcd-line2');
  line2.setAttribute('x', '10');
  line2.setAttribute('y', '48');
  line2.textContent = 'READY';
  svg.appendChild(line2);

  return svg;
}

function buildKnob(label, initialValue) {
  const group = document.createElement('div');
  group.className = 'ytls-knob-group';

  const knob = document.createElement('div');
  knob.className = 'ytls-knob';
  knob.dataset.value = initialValue;

  const indicator = document.createElement('div');
  indicator.className = 'ytls-knob-indicator';
  const angle = ((initialValue / 100) * 270) - 135;
  indicator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  knob.appendChild(indicator);

  const lbl = document.createElement('div');
  lbl.className = 'ytls-knob-label';
  lbl.textContent = label;

  group.appendChild(knob);
  group.appendChild(lbl);
  return { element: group, knob, indicator };
}

function buildToggle(label) {
  const group = document.createElement('div');
  group.className = 'ytls-toggle-group';

  const track = document.createElement('div');
  track.className = 'ytls-toggle-track';

  const handle = document.createElement('div');
  handle.className = 'ytls-toggle-handle';
  track.appendChild(handle);

  const lbl = document.createElement('div');
  lbl.className = 'ytls-toggle-label';
  lbl.textContent = label;

  group.appendChild(track);
  group.appendChild(lbl);
  return { element: group, track, handle };
}

function buildSettingsToggle(label, initialOn) {
  const row = document.createElement('div');
  row.className = 'ytls-settings-row';

  const span = document.createElement('span');
  span.textContent = label;

  const toggle = document.createElement('div');
  toggle.className = 'ytls-switch-toggle' + (initialOn ? ' on' : '');

  const dot = document.createElement('div');
  dot.className = 'ytls-switch-dot';
  toggle.appendChild(dot);

  row.appendChild(span);
  row.appendChild(toggle);
  return { element: row, toggle };
}

function buildEQSlider(freq, onChange) {
  const band = document.createElement('div');
  band.className = 'ytls-eq-band';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '-12';
  slider.max = '12';
  slider.value = '0';
  slider.step = '1';
  slider.className = 'ytls-eq-slider';
  slider.addEventListener('input', () => onChange(parseFloat(slider.value)));

  const label = document.createElement('div');
  label.className = 'ytls-eq-label';
  label.textContent = freq;

  band.appendChild(slider);
  band.appendChild(label);
  return band;
}

function buildPedalUI() {
  const pedal = document.createElement('div');
  pedal.className = 'ytls-pedal';
  pedal.id = 'yt-loop-station';

  const closeBtn = document.createElement('div');
  closeBtn.className = 'ytls-close-btn';
  closeBtn.textContent = '×';
  pedal.appendChild(closeBtn);

  const hamburger = document.createElement('div');
  hamburger.className = 'ytls-hamburger';
  for (let i = 0; i < 3; i++) {
    const line = document.createElement('div');
    line.className = 'ytls-hamburger-line';
    hamburger.appendChild(line);
  }
  pedal.appendChild(hamburger);

  const dragBar = document.createElement('div');
  dragBar.className = 'ytls-drag-bar';
  const dots = document.createElement('div');
  dots.className = 'ytls-drag-bar-dots';
  for (let i = 0; i < 5; i++) {
    const d = document.createElement('div');
    d.className = 'ytls-drag-dot';
    dots.appendChild(d);
  }
  dragBar.appendChild(dots);
  pedal.appendChild(dragBar);

  const controlPanel = document.createElement('div');
  controlPanel.className = 'ytls-control-panel';

  const lcd = buildLCD();
  controlPanel.appendChild(lcd);

  const knobsRow = document.createElement('div');
  knobsRow.className = 'ytls-knobs-row';
  const volKnob = buildKnob('VOL', 50);
  const tempoKnob = buildKnob('TEMPO', 50);
  knobsRow.appendChild(volKnob.element);
  knobsRow.appendChild(tempoKnob.element);
  controlPanel.appendChild(knobsRow);

  const togglesGrid = document.createElement('div');
  togglesGrid.className = 'ytls-toggles-grid';
  const jogA = buildToggle('JOG A');
  const jogB = buildToggle('JOG B');
  const section = buildToggle('SECTION');
  const length = buildToggle('LENGTH');
  togglesGrid.appendChild(jogA.element);
  togglesGrid.appendChild(jogB.element);
  togglesGrid.appendChild(section.element);
  togglesGrid.appendChild(length.element);
  controlPanel.appendChild(togglesGrid);

  pedal.appendChild(controlPanel);

  const logoSection = document.createElement('div');
  logoSection.className = 'ytls-logo-section';
  const logo = document.createElement('img');
  logo.src = chrome.runtime.getURL('loop-station-text.png');
  logo.alt = 'YT Loop Station';
  logoSection.appendChild(logo);
  pedal.appendChild(logoSection);

  const footArea = document.createElement('div');
  footArea.className = 'ytls-footswitch-area';
  const footswitch = document.createElement('div');
  footswitch.className = 'ytls-footswitch';
  footswitch.textContent = 'REC';
  footArea.appendChild(footswitch);
  pedal.appendChild(footArea);

  const settings = document.createElement('div');
  settings.className = 'ytls-settings-panel';
  pedal.appendChild(settings);

  return {
    pedal, closeBtn, hamburger, dragBar, lcd, settings,
    volKnob, tempoKnob, footswitch,
    toggles: { jogA, jogB, section, length }
  };
}

function buildSettingsContent(settings, audioEngine, looper, paramStore, display, refreshBookmarks) {
  settings.innerHTML = '';

  // Scale toggle
  const scaleSection = document.createElement('div');
  scaleSection.className = 'ytls-settings-section';
  const scaleToggle = buildSettingsToggle('Scale +25%', false);
  scaleSection.appendChild(scaleToggle.element);
  settings.appendChild(scaleSection);

  // Latency toggle
  const latSection = document.createElement('div');
  latSection.className = 'ytls-settings-section';
  const latToggle = buildSettingsToggle('Latency comp (150ms)', true);
  latSection.appendChild(latToggle.element);
  settings.appendChild(latSection);

  // EQ
  const eqSection = document.createElement('div');
  eqSection.className = 'ytls-settings-section';
  const eqTitle = document.createElement('div');
  eqTitle.className = 'ytls-settings-title';
  eqTitle.textContent = 'EQUALIZER';
  eqSection.appendChild(eqTitle);
  const eqContainer = document.createElement('div');
  eqContainer.className = 'ytls-eq-container';
  const eqLabels = ['60', '250', '1k', '4k', '16k'];
  eqLabels.forEach((freq, i) => {
    eqContainer.appendChild(buildEQSlider(freq, (val) => {
      audioEngine.setEQBand(i, val);
      display.showTemporary('EQ', `${freq}Hz: ${val > 0 ? '+' : ''}${val}dB`);
    }));
  });
  eqSection.appendChild(eqContainer);
  settings.appendChild(eqSection);

  // Pitch shift
  const pitchSection = document.createElement('div');
  pitchSection.className = 'ytls-settings-section ytls-pitch-section';
  const pitchTitle = document.createElement('div');
  pitchTitle.className = 'ytls-settings-title';
  pitchTitle.textContent = 'PITCH SHIFT';
  pitchSection.appendChild(pitchTitle);

  const pitchDisplay = document.createElement('div');
  pitchDisplay.className = 'ytls-pitch-display';
  pitchDisplay.textContent = '0.0';
  pitchSection.appendChild(pitchDisplay);

  const pitchSlider = document.createElement('input');
  pitchSlider.type = 'range';
  pitchSlider.min = '-24';
  pitchSlider.max = '24';
  pitchSlider.value = '0';
  pitchSlider.step = '1';
  pitchSlider.className = 'ytls-pitch-slider';
  pitchSection.appendChild(pitchSlider);

  const pitchBtns = document.createElement('div');
  pitchBtns.className = 'ytls-pitch-btns';

  function updatePitch(semitones) {
    paramStore.setPitchShift(semitones);
    paramStore.setPitchEnabled(semitones !== 0);
    pitchDisplay.textContent = (semitones >= 0 ? '+' : '') + semitones.toFixed(1);
    pitchSlider.value = String(semitones * 2);
    display.showTemporary('PITCH', `${semitones >= 0 ? '+' : ''}${semitones.toFixed(1)} st`);
  }

  const btnDown = document.createElement('button');
  btnDown.className = 'ytls-btn';
  btnDown.textContent = '-0.5';
  btnDown.addEventListener('click', () => updatePitch(paramStore.pitchShift - 0.5));

  const btnReset = document.createElement('button');
  btnReset.className = 'ytls-btn';
  btnReset.textContent = '0';
  btnReset.addEventListener('click', () => updatePitch(0));

  const btnUp = document.createElement('button');
  btnUp.className = 'ytls-btn';
  btnUp.textContent = '+0.5';
  btnUp.addEventListener('click', () => updatePitch(paramStore.pitchShift + 0.5));

  pitchBtns.appendChild(btnDown);
  pitchBtns.appendChild(btnReset);
  pitchBtns.appendChild(btnUp);
  pitchSection.appendChild(pitchBtns);

  pitchSlider.addEventListener('input', () => {
    updatePitch(parseFloat(pitchSlider.value) / 2);
  });

  settings.appendChild(pitchSection);

  // Bookmarks
  const bmSection = document.createElement('div');
  bmSection.className = 'ytls-settings-section';
  const bmTitle = document.createElement('div');
  bmTitle.className = 'ytls-settings-title';
  bmTitle.textContent = 'BOOKMARKS';
  bmSection.appendChild(bmTitle);

  const bmSaveBtn = document.createElement('button');
  bmSaveBtn.className = 'ytls-btn';
  bmSaveBtn.textContent = 'Save Bookmark';
  bmSaveBtn.addEventListener('click', () => {
    const name = prompt('Bookmark name:');
    if (!name) return;
    const bookmarks = getBookmarks();
    bookmarks.push({
      name,
      url: window.location.href,
      pointA: looper.pointA,
      pointB: looper.pointB,
      volume: paramStore.volume,
      tempo: paramStore.tempo,
      timestamp: Date.now()
    });
    saveBookmarks(bookmarks);
    refreshBookmarks();
    display.showTemporary('SAVED', name);
  });
  bmSection.appendChild(bmSaveBtn);

  const bmList = document.createElement('div');
  bmList.className = 'ytls-bookmark-list';
  bmSection.appendChild(bmList);
  settings.appendChild(bmSection);

  // Build info
  const buildInfo = document.createElement('div');
  buildInfo.className = 'ytls-build-info';
  buildInfo.textContent = 'YT Loop Station v2.0';
  settings.appendChild(buildInfo);

  return {
    scaleToggle: scaleToggle.toggle,
    latToggle: latToggle.toggle,
    bmList,
    updatePitch
  };
}

// --- Main creation function ---

let activeCleanup = null;
const PENDING_BM_KEY = 'ytLoopStationPendingBookmark';

function createLoopStation(video) {
  if (!video || document.getElementById('yt-loop-station')) return;
  debugLog('Creating loop station for video:', video.src || video.currentSrc);

  injectStyles();

  // Build core objects
  const paramStore = new ParameterStore(video);
  const audioEngine = new HighQualityAudioEngine(video);
  audioEngine.setup();

  const looper = new VideoLooper(video);
  looper.setAudioContext(audioEngine.audioContext, audioEngine.gainNode);

  const manipulator = new LoopManipulator(looper);

  // Build UI
  const ui = buildPedalUI();
  const display = new DigitalDisplay(ui.lcd);

  // Track listeners for cleanup
  const listeners = [];
  function addListener(el, event, handler, opts) {
    el.addEventListener(event, handler, opts);
    listeners.push({ el, event, handler, opts });
  }

  // Refresh bookmarks
  function refreshBookmarks() {
    const bookmarks = getBookmarks();
    settingsUI.bmList.innerHTML = '';
    bookmarks.forEach((bm, i) => {
      const item = document.createElement('div');
      item.className = 'ytls-bookmark-item';

      const name = document.createElement('span');
      name.className = 'ytls-bookmark-name';
      name.textContent = bm.name;
      name.addEventListener('click', () => activateBookmark(bm));

      const delBtn = document.createElement('button');
      delBtn.className = 'ytls-btn';
      delBtn.textContent = '×';
      delBtn.addEventListener('click', () => {
        const bms = getBookmarks();
        bms.splice(i, 1);
        saveBookmarks(bms);
        refreshBookmarks();
      });

      item.appendChild(name);
      item.appendChild(delBtn);
      settingsUI.bmList.appendChild(item);
    });
  }

  const settingsUI = buildSettingsContent(
    ui.settings, audioEngine, looper, paramStore, display, refreshBookmarks
  );
  refreshBookmarks();


  function updateKnobVisual(knobObj, value) {
    const angle = ((value / 100) * 270) - 135;
    knobObj.indicator.style.transform = `translateX(-50%) rotate(${angle}deg)`;
    knobObj.knob.dataset.value = value;
  }

  function setupKnobDrag(knobObj, onChange) {
    let dragging = false;
    let startY = 0;
    let startVal = 0;

    addListener(knobObj.knob, 'mousedown', (e) => {
      e.preventDefault();
      dragging = true;
      startY = e.clientY;
      startVal = parseFloat(knobObj.knob.dataset.value);
      audioEngine.resumeContext();
    });

    addListener(document, 'mousemove', (e) => {
      if (!dragging) return;
      const delta = (startY - e.clientY) * 0.5;
      const newVal = clamp(Math.round(startVal + delta), 0, 100);
      updateKnobVisual(knobObj, newVal);
      onChange(newVal);
    });

    addListener(document, 'mouseup', () => { dragging = false; });
  }

  setupKnobDrag(ui.volKnob, (val) => {
    paramStore.setVolume(val);
    display.showTemporary('VOLUME', `${val}%`);
  });

  setupKnobDrag(ui.tempoKnob, (val) => {
    paramStore.setTempo(val);
    const rate = tempoToRate(val);
    audioEngine.smoothRateChange(rate);
    display.showTemporary('TEMPO', `${val}% (${rate.toFixed(2)}x)`);
  });


  function setupToggle(toggleObj, onLeft, onRight) {
    addListener(toggleObj.track, 'mousedown', (e) => {
      const rect = toggleObj.track.getBoundingClientRect();
      const isLeft = e.clientX < rect.left + rect.width / 2;
      toggleObj.handle.classList.add(isLeft ? 'left' : 'right');
      if (isLeft) onLeft();
      else onRight();
    });

    addListener(toggleObj.track, 'mouseup', () => {
      toggleObj.handle.classList.remove('left', 'right');
    });

    addListener(toggleObj.track, 'mouseleave', () => {
      toggleObj.handle.classList.remove('left', 'right');
    });
  }

  setupToggle(ui.toggles.jogA,
    () => { const v = looper.jogPoint('A', -0.05); if (v != null) display.showTemporary('JOG A', formatTime(v)); },
    () => { const v = looper.jogPoint('A', 0.05); if (v != null) display.showTemporary('JOG A', formatTime(v)); }
  );

  setupToggle(ui.toggles.jogB,
    () => { const v = looper.jogPoint('B', -0.05); if (v != null) display.showTemporary('JOG B', formatTime(v)); },
    () => { const v = looper.jogPoint('B', 0.05); if (v != null) display.showTemporary('JOG B', formatTime(v)); }
  );

  setupToggle(ui.toggles.section,
    () => { manipulator.jumpSection(-1); display.showTemporary('SECTION', '← PREV'); },
    () => { manipulator.jumpSection(1); display.showTemporary('SECTION', 'NEXT →'); }
  );

  setupToggle(ui.toggles.length,
    () => { manipulator.halfLoopLength(); const l = looper.getLoopLength(); display.showTemporary('LENGTH', l ? `÷2 = ${l.toFixed(2)}s` : '÷2'); },
    () => { manipulator.doubleLoopLength(); const l = looper.getLoopLength(); display.showTemporary('LENGTH', l ? `×2 = ${l.toFixed(2)}s` : '×2'); }
  );

  let footState = 0;
  let resetTimeout = null;

  function updateFootswitch() {
    ui.footswitch.classList.remove('rec', 'play');
    if (footState === 0) {
      ui.footswitch.textContent = 'REC';
    } else if (footState === 1) {
      ui.footswitch.textContent = 'REC';
      ui.footswitch.classList.add('rec');
    } else {
      ui.footswitch.textContent = 'PLAY';
      ui.footswitch.classList.add('play');
    }
  }

  function activateBookmark(bm) {
    applyBookmark(bm, looper, paramStore, display);
    updateKnobVisual(ui.volKnob, paramStore.volume);
    updateKnobVisual(ui.tempoKnob, paramStore.tempo);
    footState = 2;
    updateFootswitch();
  }

  addListener(ui.footswitch, 'click', () => {
    audioEngine.resumeContext();
    if (resetTimeout) {
      clearTimeout(resetTimeout);
      resetTimeout = null;
    }
    if (footState === 0) {
      const a = looper.setPointA();
      display.showLoopInfo(a, null, 'rec');
      footState = 1;
    } else if (footState === 1) {
      const b = looper.setPointB();
      if (b != null) {
        looper.startLoop();
        display.showLoopInfo(looper.pointA, looper.pointB, 'play');
        footState = 2;
      } else {
        display.showTemporary('ERROR', 'B must be after A');
      }
    } else {
      looper.stopLoop();
      display.update('STOPPED', '');
      footState = 0;
      resetTimeout = setTimeout(() => {
        resetTimeout = null;
        if (footState === 0) {
          looper.reset();
          display.update('YT LOOP STATION', 'READY');
        }
      }, 2000);
    }
    updateFootswitch();
  });


  let isDragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  addListener(ui.dragBar, 'mousedown', (e) => {
    isDragging = true;
    const rect = ui.pedal.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    ui.dragBar.style.cursor = 'grabbing';
  });

  addListener(document, 'mousemove', (e) => {
    if (!isDragging) return;
    ui.pedal.style.left = (e.clientX - dragOffsetX) + 'px';
    ui.pedal.style.top = (e.clientY - dragOffsetY) + 'px';
    ui.pedal.style.right = 'auto';
  });

  addListener(document, 'mouseup', () => {
    if (isDragging) {
      isDragging = false;
      ui.dragBar.style.cursor = 'grab';
    }
  });


  addListener(ui.hamburger, 'click', () => {
    ui.settings.classList.toggle('open');
  });


  addListener(settingsUI.scaleToggle, 'click', () => {
    settingsUI.scaleToggle.classList.toggle('on');
    ui.pedal.classList.toggle('ytls-scaled', settingsUI.scaleToggle.classList.contains('on'));
  });


  addListener(settingsUI.latToggle, 'click', () => {
    settingsUI.latToggle.classList.toggle('on');
    looper.latencyEnabled = settingsUI.latToggle.classList.contains('on');
  });

  function cleanup() {
    if (resetTimeout) clearTimeout(resetTimeout);
    paramStore.stopContinuousApply();
    looper.stopLoop();
    audioEngine.destroy();
    listeners.forEach(({ el, event, handler, opts }) => {
      el.removeEventListener(event, handler, opts);
    });
    ui.pedal.remove();
    activeCleanup = null;
    debugLog('Loop station destroyed');
  }

  addListener(ui.closeBtn, 'click', cleanup);

  paramStore.startContinuousApply();
  document.body.appendChild(ui.pedal);

  // Check for pending bookmark
  const pending = localStorage.getItem(PENDING_BM_KEY);
  if (pending) {
    localStorage.removeItem(PENDING_BM_KEY);
    try {
      const bm = JSON.parse(pending);
      setTimeout(() => activateBookmark(bm), 500);
    } catch (e) {
      debugLog('Failed to load pending bookmark:', e);
    }
  }

  activeCleanup = cleanup;
  debugLog('Loop station created');
  return cleanup;
}

// --- Observer & Message Listener ---

function findVideoAndCreate(retries = 10) {
  const video = document.querySelector('video');
  if (video) {
    createLoopStation(video);
    return;
  }
  if (retries > 0) {
    setTimeout(() => findVideoAndCreate(retries - 1), 200);
  } else {
    debugLog('No video element found after retries');
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggle_pedal') {
    if (activeCleanup) {
      activeCleanup();
    } else {
      findVideoAndCreate();
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem(PENDING_BM_KEY)) findVideoAndCreate();
  });
} else {
  if (localStorage.getItem(PENDING_BM_KEY)) findVideoAndCreate();
}
