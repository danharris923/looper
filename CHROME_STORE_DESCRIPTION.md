# Chrome Web Store Listing

## Extension Name
YT Loop Station

## Tagline (132 characters max)
Professional loop station for YouTube videos with 30ms crossfade technology for seamless, gapless audio looping.

## Short Description (132 characters max)
Precision A/B looping with crossfade technology. Perfect for music practice, language learning, and video transcription.

## Detailed Description (16,000 characters max)

YT Loop Station is a professional-grade video looping extension for YouTube that provides precision loop control with advanced crossfade technology to eliminate audio gaps and pops during loop transitions.

KEY FEATURES

A/B Loop Points
Set precise start and end points for loop regions on any YouTube video. The extension marks Point A (loop start) and Point B (loop end) with millisecond accuracy, allowing you to isolate specific sections of video content for focused study or practice.

Crossfade Looping Technology
Implements a 30-millisecond crossfade algorithm using the Web Audio API to create seamless, gapless loop transitions. This eliminates the audible clicks, pops, and silence gaps that occur with standard looping methods, providing professional-quality continuous playback.

Real-Time Audio Controls
- Volume Control: 0-100% adjustment with smooth gain ramping
- Tempo Control: Playback speed from 0.5x (half speed) to 2.0x (double speed) with center detent at 1.0x normal speed
- Persistent Parameters: Settings maintain throughout video playback session

Loop Manipulation
- JOG A/B Controls: Fine-tune loop points in 50-millisecond (0.05 second) increments for precision adjustment
- SECTION Navigation: Jump forward or backward by the current loop length to quickly explore adjacent video sections
- LENGTH Modifier: Instantly halve or double the loop length to expand or contract your practice region

Professional Interface
- LCD-Style Display: Real-time feedback showing loop status, timestamps, parameter values, and control actions
- Three-State Footswitch: Visual operation cycle with color-coded states (SET A → SET B → STOP)
- Draggable Panel: Repositionable control interface that won't block video content
- Rotary Knobs: Analog-style volume and tempo controls with smooth drag interaction
- Toggle Switches: Professional three-position switches for JOG, SECTION, and LENGTH controls

USAGE WORKFLOW

1. Navigate to any YouTube video (standard videos and Shorts supported)
2. Click the YT Loop Station extension icon in your Chrome toolbar
3. Click the footswitch to set Point A (loop start) - indicator shows red "REC"
4. Click the footswitch again to set Point B (loop end) - indicator shows green "PLAY" and looping begins
5. Use knobs and switches to adjust volume, tempo, and loop parameters in real-time
6. Click the footswitch a third time to stop looping

USE CASES

Music Practice
Loop specific measures or phrases in music tutorial videos for focused practice. Adjust tempo to slow down difficult passages while maintaining pitch, or use the JOG controls to fine-tune loop boundaries to exact note positions.

Language Learning
Repeat dialogue segments, pronunciation examples, or vocabulary lessons. The precise loop control allows isolation of individual words or phrases, while tempo adjustment enables comprehension at slower speeds.

Transcription Work
Loop audio segments repeatedly while transcribing spoken content. The seamless crossfade prevents jarring transitions that disrupt concentration during extended transcription sessions.

Dance and Movement
Practice choreography by looping specific movement sequences. The LENGTH control allows quick doubling of loop regions to include additional steps, while SECTION navigation helps move through a routine systematically.

Academic Study
Review specific portions of educational videos, lectures, or demonstrations. Set loops around key concepts or complex explanations for repeated viewing without manual seeking.

TECHNICAL SPECIFICATIONS

Audio Processing
- Web Audio API integration with MediaElementSource nodes
- Real-time gain automation for crossfade transitions
- 30ms crossfade duration optimized to prevent audible artifacts
- Sample-accurate loop point positioning

Browser Compatibility
- Chrome browser (Manifest V3 compliant)
- Minimum Chrome version: 88
- Works on all YouTube pages including standard videos, live streams, and Shorts

Privacy and Security
- Operates entirely client-side within the browser
- No data collection or external transmission
- No tracking or analytics
- Requires only activeTab permission for video element access
- No background processes when extension is not active

Performance
- Minimal CPU overhead during looping
- No impact on video quality or playback
- Parameter changes applied in real-time without buffering
- Responsive interface with sub-100ms interaction latency

INSTALLATION AND SETUP

1. Install the extension from the Chrome Web Store
2. The extension icon appears in your Chrome toolbar
3. Navigate to any YouTube video
4. Click the extension icon to activate the loop station interface
5. No configuration or additional setup required

CONTROLS REFERENCE

Footswitch (Three States)
- State 1 (REC - Dark Grey): Ready to set Point A
- State 2 (REC - Red): Point A set, awaiting Point B
- State 3 (PLAY - Green): Loop active between A and B
- Returns to State 1 after stop command and 2-second reset delay

VOL Knob (Drag Up/Down)
- Range: 0% to 100%
- Default: 50%
- Real-time volume adjustment during playback

TEMPO Knob (Drag Up/Down)
- Range: 0.5x to 2.0x playback speed
- Center position (50%): 1.0x normal speed
- Lower half (0-50%): 0.5x to 1.0x speed
- Upper half (50-100%): 1.0x to 2.0x speed

JOG A Toggle (Click Left/Right)
- Left: Move Point A backward by 50ms
- Right: Move Point A forward by 50ms
- Prevents overlap with Point B

JOG B Toggle (Click Left/Right)
- Left: Move Point B backward by 50ms
- Right: Move Point B forward by 50ms
- Prevents overlap with Point A

SECTION Toggle (Click Left/Right)
- Left: Jump backward by current loop length
- Right: Jump forward by current loop length
- Maintains loop length while repositioning

LENGTH Toggle (Click Left/Right)
- Left: Halve the current loop length (0.5x)
- Right: Double the current loop length (2.0x)
- Maintains Point A position while adjusting Point B

LCD Display
- Line 1: Loop status and timestamps
- Line 2: Loop length or parameter feedback
- Updates in real-time during operation

VERSION 1.0.2

Recent updates:
- Fixed audio initialization and parameter application
- Restored crossfade technique for gap elimination
- Added visual feedback for all knob and button actions
- Resolved duplicate MediaElementSource errors
- Standardized toggle switch alignment and sizing

SUPPORT

The extension requires no external services or accounts. All functionality operates within the browser using standard Web APIs. If you encounter issues, verify that:
- You are using Chrome browser version 88 or higher
- The video page has fully loaded before activating the extension
- The video element is accessible (not DRM-protected)

YT Loop Station is designed for users who require professional-level control over video playback for practice, study, transcription, or analysis workflows.

## Category
Productivity

## Language
English

## Screenshots Required
- 1280x800 or 640x400 (provide 3-5 screenshots showing):
  1. Loop station interface on a YouTube video
  2. Close-up of controls and LCD display
  3. Loop active state with green PLAY indicator
  4. Parameter adjustment (knob or toggle in use)
  5. Different positions on screen (showing draggable feature)

## Icon
- 128x128px (already exists as icon128.png)

## Small Tile Icon
- 440x280px (will need to create)

## Promotional Images (Optional but Recommended)
- Marquee: 1400x560px
- Small tile: 440x280px

## Privacy Policy
This extension does not collect, store, or transmit any user data. All functionality operates entirely client-side within the browser. No analytics, tracking, or external network requests are made. The extension requires only the activeTab permission to access video elements on the current YouTube page.

## Permissions Justification

activeTab: Required to access and manipulate the HTML5 video element on YouTube pages for loop control functionality.

## Target Audience
- Musicians and music students
- Language learners
- Transcriptionists
- Dancers and choreographers
- Students and educators
- Content creators
- Researchers and analysts

## Keywords/Search Terms
- YouTube looper
- Video loop
- A/B loop
- Music practice
- Language learning
- Video repeat
- Seamless loop
- Crossfade
- Tempo control
- Playback speed

## Pricing
Free

## Mature Content
No

## Accessibility Features
- High-contrast LCD display
- Large interactive controls
- Clear visual state indicators
- Keyboard-free operation (mouse/click only)
