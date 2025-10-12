# YT Loop Station

A Chrome browser extension that provides precision looping controls for YouTube videos with crossfade technology to eliminate audio gaps and pops during loop transitions.

## Technical Overview

YT Loop Station implements a professional-grade audio looping system using the Web Audio API to enable seamless, gapless playback loops on YouTube videos. The extension employs a 30-millisecond crossfade technique at loop boundaries to prevent audible clicks and silence gaps that occur with standard looping implementations.

## Features

### Core Looping Functionality
- **A/B Loop Points**: Set precise start (Point A) and end (Point B) timestamps for loop regions
- **Crossfade Looping**: 30ms crossfade algorithm eliminates audio discontinuities at loop boundaries
- **Real-time Loop Control**: Immediate playback response to loop parameter adjustments
- **Persistent State**: Loop parameters maintained during video playback

### Audio Controls
- **Volume Control**: 0-100% volume adjustment with Web Audio API gain nodes
- **High-Quality Tempo Control**: Playback speed range from 0.5x to 2.0x with pitch preservation
  - 0-50% knob position: 0.5x - 1.0x speed
  - 50-100% knob position: 1.0x - 2.0x speed
  - **Pitch Preservation**: Native HTML5 preservesPitch maintains constant pitch at all speeds
  - Smooth interpolation reduces audio artifacts during tempo changes
  - Crossfade buffering minimizes clicks and pops
  - Gradual rate transitions for professional audio quality
  - No chipmunk effect - audio remains natural at all playback rates
- **Parameter Persistence**: Volume and tempo settings persist during video session

### Loop Manipulation Controls
- **JOG A/B**: Fine-tune loop point positions in 0.05 second increments (±50ms)
- **SECTION Jump**: Navigate forward/backward by current loop length
- **LENGTH Modifier**: Halve (0.5x) or double (2.0x) the current loop length

### User Interface
- **LCD Display**: Real-time feedback showing loop status, timestamps, and parameter values
- **Footswitch Control**: Three-state operation cycle (SET A → SET B → STOP)
- **Draggable Interface**: Repositionable control panel with drag handle
- **Visual Feedback**: LED-style indicators for loop state (REC/PLAY/STOP)

## Installation Instructions

### Manual Installation (Developer Mode)

1. Download the extension files or clone the repository
2. Open Google Chrome browser
3. Navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle switch in the top-right corner
5. Click "Load unpacked" button
6. Select the `dist` folder from the downloaded extension files
7. The extension icon will appear in the Chrome toolbar

### Verification

After installation, the extension icon should be visible in the Chrome toolbar. Navigate to any YouTube video page and click the icon to verify the loop station interface appears.

## Usage Instructions

### Basic Looping Workflow

1. Navigate to a YouTube video (standard player or Shorts)
2. Click the YT Loop Station extension icon in the Chrome toolbar
3. Click the footswitch once to set Point A (loop start) - footswitch displays "REC" in red
4. Click the footswitch again to set Point B (loop end) - footswitch displays "PLAY" in green and looping begins
5. Click the footswitch a third time to stop looping - footswitch displays "REC" in dark grey
6. Loop points reset after 2 seconds of stopping

### Control Reference

#### Footswitch
- **State 1 (REC - Dark Grey)**: Ready to set Point A
- **State 2 (REC - Red)**: Point A set, ready to set Point B
- **State 3 (PLAY - Green)**: Loop active, playing between A and B
- **Returns to State 1**: After stopping and 2-second delay

#### Rotary Knobs (Drag Up/Down)
- **VOL**: Volume control (0-100%)
- **TEMPO**: Playback speed (0.5x - 2.0x, center position = 1.0x normal speed)

#### Toggle Switches (Click Left/Right)
- **JOG A**: Move Point A backward (left) or forward (right) by 50ms
- **JOG B**: Move Point B backward (left) or forward (right) by 50ms
- **SECTION**: Jump to previous (left) or next (right) section by current loop length
- **LENGTH**: Halve loop length (left) or double loop length (right)

#### LCD Display
Shows current loop status, timestamps, parameter feedback, and control actions in real-time.

## Technical Implementation

### Architecture

The extension uses a content script injection model with the following components:

- **VideoLooper**: Core looping engine with Web Audio API crossfade implementation
- **HighQualityAudioEngine**: Enhanced audio processing with buffered tempo control
  - Smooth rate interpolation using exponential easing
  - Crossfade gain automation during tempo changes
  - Dedicated tempo gain node for artifact reduction
- **LoopManipulator**: Loop parameter modification and section navigation
- **DigitalDisplay**: LCD-style visual feedback system
- **ParameterStore**: Persistent parameter storage with continuous application

### Audio Processing

#### Crossfade Looping
The crossfade algorithm uses Web Audio API gain node automation to create smooth transitions:
1. At loop end minus 30ms, fade-out begins using linearRampToValueAtTime
2. Playback position jumps to Point A during crossfade
3. Fade-in occurs at Point A over 30ms duration
4. Process repeats for continuous gapless looping

#### Pitch-Preserved Tempo Control
The tempo control system combines multiple techniques for professional audio quality:
1. **Native Pitch Preservation**: Uses HTML5 `preservesPitch` property (baseline 2023)
   - Automatically maintains constant pitch across all playback speeds
   - Eliminates "chipmunk effect" at higher speeds
   - Cross-browser compatible (Chrome, Firefox, Safari)
2. **Smooth Rate Interpolation**: Exponential easing prevents abrupt tempo changes
3. **Crossfade Buffering**: 50ms gain ramping minimizes audio artifacts during transitions
4. **Continuous Application**: Parameters persistently enforced to prevent browser resets

### Browser Compatibility

- Requires Chrome browser (Manifest V3)
- Uses Web Audio API (AudioContext, MediaElementSource, GainNode)
- Requires permission: `activeTab` for video element access
- Compatible with all YouTube pages including standard videos and Shorts

## Use Cases

- **Music Practice**: Loop specific sections of music tutorial videos for practice repetition
- **Language Learning**: Repeat dialogue or pronunciation segments in educational videos
- **Transcription**: Loop audio segments while transcribing spoken content
- **Dance Choreography**: Practice dance moves by looping specific sections
- **Audio Analysis**: Examine specific portions of audio content with precise control

## File Structure

```
dist/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for extension activation
├── content.js             # Main extension logic and UI
├── loop-station-text.png  # Logo graphic
└── icon*.png              # Extension icons (16, 32, 48, 128px)
```

## Version History

### Version 1.0.3 (In Development)
- **Enhanced Audio Quality**: Added smooth interpolation and crossfade buffering for tempo changes
- **Pitch Preservation**: Implemented native HTML5 preservesPitch for constant pitch at all playback speeds
- **Improved Tempo Control**: Exponential easing and gain ramping eliminate audio artifacts
- **Cross-browser Support**: Pitch preservation compatibility for Chrome, Firefox, and Safari

### Version 1.0.2
- Fixed audio initialization and parameter application issues
- Restored edge bleed crossfade technique for gap elimination
- Added visual feedback for knob and button actions
- Fixed duplicate MediaElementSource error
- Fixed toggle switch alignment and sizing

## Technical Requirements

- Google Chrome browser (version 88 or higher)
- Active internet connection for YouTube access
- No additional dependencies or external services required

## Permissions

The extension requests the following permission:
- **activeTab**: Required to access and control video elements on the current YouTube tab

## Privacy

This extension operates entirely client-side within the browser. No data is collected, transmitted, or stored externally. All loop parameters and settings exist only in the current browser session.

## License

Version 1.0.2
