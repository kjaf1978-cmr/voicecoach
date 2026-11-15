# VoiceCoach

Offline speech, voice and communication trainer (Logopädie / orthophonie) for Android phones.
Interface and training content in English, German and French; professional, casual and academic settings.

**Install:** open https://kjaf1978-cmr.github.io/voicecoach/ in Chrome on Android → ⋮ → *Add to Home screen* → *Install*.

## Features
- Graded conversations (6 scenes × 3 languages), 3 levels per scene (Guided 70 / Cued 75 / Free 80 pass mark), repeat until passed
- Spaced-repetition reviews of mastered scenes (1, 3, 7, 14, 30, 60 days); a failed review drops the scene back to level 2
- Articulation drills with mastery tracking (9 of the last 10 correct), minimal pairs, tongue twisters, reading-pace trainer
- Live pitch and loudness, steady-tone timer, recorder, maximum phonation time, s/z ratio, breathing routines
- Progress dashboard; all data stays on the phone (localStorage)

Automatic answer scoring uses Chrome's speech recognition (usually needs internet). Without it, the app uses a 4-criterion self-rating.

Not a medical device and not a replacement for a speech-language therapist.

## Development
Sources are in `src/` (`index.html`, `i18n.js`, `content.js`, `app.js`). Run `python3 tools/build.py` (expects the `src/` + `dist/` layout) and copy `dist/VoiceCoach/*` to the repository root.
