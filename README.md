# VoiceCoach

Offline speech, voice and communication trainer (Logopädie / orthophonie / speech therapy practice) for Android phones.
Interface and training content in **English, German and French**; **professional, casual and academic** settings.

**Install:** open https://kjaf1978-cmr.github.io/voicecoach/ in Chrome on Android → tap **⬇ Install app** (or ⋮ → *Add to Home screen* → *Install*).

## Features (v3)
- **Daily plan** built each day from your voice-test weak points, due reviews, next conversation level and an unread lesson; 14-day completion calendar and streak.
- **Voice test** (read a passage + 20 s free speech) → voice profile: pace, pauses, melody, projection, clarity, fluency, median pitch; strengths and focus areas; history chart.
- **Roleplay conversations** (12 scenes × 3 languages, incl. salary negotiation, critical feedback, saying no to family, parenting, presentation opening, asking a professor for an extension). The partner speaks (text-to-speech) and **pushes back** when your answer is vague. Three levels (Guided 70 / Cued 75 / Free 80 pass mark), repeated until passed; spaced-repetition reviews (1–3–7–14–30–60 days). Every answer is **recorded, replayed and analysed** with tips; feedback covers what worked, what to improve, filler words and model phrasings. Text roleplay mode with hints.
- **Practice studio**: audio or **front-camera video** recording, import of existing files, replay with a timeline (loudness, pitch, pauses, red markers for moments to correct) and tap-to-jump tips; body-language checklist for video.
- **Articulation series check** (v3.2): several words in a row, hands-free (model pronunciation → beep → you speak → auto-advance on silence); per-word diagnosis of the wrong sound (e.g. “s sounded like t at the start”) with a specific correction hint, your recording, model and slow model playback, single-word re-practice and a repeat round for the wrong words.
- **Drills**: intonation (stress the marked word), projection (count 1–10 with rising loudness), tongue twisters scored for clarity and speed, articulation with mastery tracking, minimal pairs, reading-pace trainer, impromptu speaking, filler counter, breathing, MPT, s/z ratio, live pitch and loudness.
- **Lessons**: 9 short lessons (pauses, falling statements, melody, pace, breath support, fillers, STAR, handling pushback, body language), each with a recorded "Try it".
- **My recordings** library (stored on the phone, IndexedDB) with replay, share (WhatsApp, e-mail…) and download.
- Progress dashboard: mastery per setting/language, conversation scores, voice-score history, articulation mastery, measurements.

Speech recognition (for content scoring, fillers and clarity) uses Chrome's built-in service and usually needs internet. If the phone cannot record and recognise at the same time, the app switches to *recording + self-check of key points*. All voice analysis (pace, pauses, pitch, loudness) runs on the phone.

Not a medical device and not a replacement for a speech-language therapist.

## Development
Sources in `src/`; build with `python3 tools/build.py` → `index.html`, `manifest.webmanifest`, `sw.js` at the repository root (served by GitHub Pages) and `dist/artifact.html`.
