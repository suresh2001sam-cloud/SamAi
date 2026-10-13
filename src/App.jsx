from pathlib import Path
import re

src = Path("/mnt/data/SAM_App_original.txt").read_text(encoding="utf-8")

# Add voice state
src = src.replace(
'  const [voiceLanguage, setVoiceLanguage] = useState("ta-IN");\n',
'  const [voiceLanguage, setVoiceLanguage] = useState("ta-IN");\n'
'  const [availableVoices, setAvailableVoices] = useState([]);\n'
'  const [voiceName, setVoiceName] = useState("");\n'
)

# Insert voice loading effect before the cleanup effect
needle = '''  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
'''
replacement = '''  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setVoiceError("இந்த browser-ல் voice playback support இல்லை.");
      return undefined;
    }

    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);

    // Some browsers fire voiceschanged only through the property.
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
      if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
'''
src = src.replace(needle, replacement)

# Replace speakReply
start = src.index('  function speakReply(text) {')
end = src.index('\n  async function sendText(text) {', start)
speak = '''  function speakReply(text) {
    if (!voiceEnabled) {
      setVoiceError("Settings-ல் Read SAM replies aloud-ஐ enable செய்யுங்கள்.");
      return;
    }

    if (!("speechSynthesis" in window)) {
      setVoiceError("இந்த browser-ல் voice playback support இல்லை.");
      return;
    }

    const cleanText = String(text || "").trim();
    if (!cleanText) return;

    window.speechSynthesis.cancel();
    setSpeaking(false);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLanguage;
    utterance.rate = 0.94;
    utterance.pitch = 1.08;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((voice) => voice.voiceURI === voiceName);
    const languageCode = voiceLanguage.split("-")[0].toLowerCase();

    const sameLanguageVoice = voices.find(
      (voice) => voice.lang.toLowerCase() === voiceLanguage.toLowerCase()
    );
    const languageFallback = voices.find(
      (voice) => voice.lang.toLowerCase().startsWith(languageCode)
    );

    const chosenVoice = selectedVoice || sameLanguageVoice || languageFallback;
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    }

    utterance.onstart = () => {
      setSpeaking(true);
      setVoiceError("");
    };
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => {
      setSpeaking(false);
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setVoiceError("Voice play ஆகவில்லை. வேறு voice தேர்வு செய்து முயற்சி செய்யுங்கள்.");
      }
    };

    // Resume first to avoid a paused speech engine on some browsers.
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }
'''
src = src[:start] + speak + src[end:]

# Improve recognition language error behavior and set state before starting
src = src.replace(
'''    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "not-allowed"
          ? "Microphone permission Allow செய்யுங்கள்."
          : `Voice error: ${event.error}. மீண்டும் முயற்சி செய்யுங்கள்.`
      );
      setListening(false);
    };
''',
'''    recognition.onerror = (event) => {
      const messages = {
        "not-allowed": "Microphone permission Allow செய்யுங்கள்.",
        "service-not-allowed": "இந்த browser-ல் speech service அனுமதிக்கப்படவில்லை.",
        "no-speech": "குரல் கேட்கவில்லை. Mic அழுத்தி மீண்டும் பேசுங்கள்.",
        "audio-capture": "Microphone கண்டறியப்படவில்லை. Mic connection-ஐ சரிபாருங்கள்.",
        "network": "Voice recognition network பிழை. Internet connection-ஐ சரிபாருங்கள்."
      };
      setVoiceError(messages[event.error] || `Voice error: ${event.error}. மீண்டும் முயற்சி செய்யுங்கள்.`);
      setListening(false);
    };
'''
)

# Add voice picker beside language picker
old = '''                <label className="voice-language">
                  <span>Language</span>
                  <select value={voiceLanguage} onChange={(event) => setVoiceLanguage(event.target.value)} disabled={listening}>
                    <option value="ta-IN">தமிழ்</option>
                    <option value="en-IN">English</option>
                  </select>
                </label>
'''
new = '''                <label className="voice-language">
                  <span>Language</span>
                  <select
                    value={voiceLanguage}
                    onChange={(event) => {
                      setVoiceLanguage(event.target.value);
                      setVoiceName("");
                    }}
                    disabled={listening}
                  >
                    <option value="ta-IN">தமிழ்</option>
                    <option value="en-IN">English (India)</option>
                  </select>
                </label>

                <label className="voice-language voice-picker">
                  <span>Voice</span>
                  <select
                    aria-label="Choose SAM voice"
                    value={voiceName}
                    onChange={(event) => setVoiceName(event.target.value)}
                    disabled={listening}
                  >
                    <option value="">Auto select</option>
                    {availableVoices
                      .filter((voice) =>
                        voice.lang.toLowerCase().startsWith(
                          voiceLanguage.split("-")[0].toLowerCase()
                        )
                      )
                      .map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                  </select>
                </label>
'''
src = src.replace(old, new)

# Add voice options to Settings panel too
old_settings = '''                        <select value={voiceLanguage} onChange={(event) => setVoiceLanguage(event.target.value)}>
                          <option value="ta-IN">Tamil</option>
                          <option value="en-IN">English (India)</option>
                        </select>
                      </label>
                      <label>
                        <input type="checkbox" checked={voiceEnabled} onChange={(event) => setVoiceEnabled(event.target.checked)} />
'''
new_settings = '''                        <select
                          value={voiceLanguage}
                          onChange={(event) => {
                            setVoiceLanguage(event.target.value);
                            setVoiceName("");
                          }}
                        >
                          <option value="ta-IN">Tamil</option>
                          <option value="en-IN">English (India)</option>
                        </select>
                      </label>
                      <label>
                        SAM voice
                        <select value={voiceName} onChange={(event) => setVoiceName(event.target.value)}>
                          <option value="">Auto select</option>
                          {availableVoices
                            .filter((voice) =>
                              voice.lang.toLowerCase().startsWith(
                                voiceLanguage.split("-")[0].toLowerCase()
                              )
                            )
                            .map((voice) => (
                              <option key={voice.voiceURI} value={voice.voiceURI}>
                                {voice.name} ({voice.lang})
                              </option>
                            ))}
                        </select>
                      </label>
                      <label>
                        <input type="checkbox" checked={voiceEnabled} onChange={(event) => setVoiceEnabled(event.target.checked)} />
'''
src = src.replace(old_settings, new_settings)

# Avoid claiming file upload is working, leave existing behavior intact.
out = Path("/mnt/data/SAM_App_updated.jsx")
out.write_text(src, encoding="utf-8")

css = r'''/* SAM AI Buddy - responsive/robot reaction patch
   Append this file's contents to the END of src/style.css.
   This is an override patch, not a replacement for your existing stylesheet. */

.voice-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.voice-language {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.voice-language select {
  max-width: 100%;
  min-width: 0;
}

.voice-picker select {
  max-width: 190px;
}

.hero-robot {
  isolation: isolate;
  transform-origin: center bottom;
}

.hero-robot .robot-character {
  transform-origin: center bottom;
  will-change: transform;
}

.hero-robot.idle .robot-character {
  animation: sam-idle-bob 3.4s ease-in-out infinite;
}

.hero-robot.listening .robot-character {
  animation: sam-listening-bob 0.8s ease-in-out infinite;
}

.hero-robot.thinking .robot-character {
  animation: sam-thinking-tilt 1.2s ease-in-out infinite;
}

.hero-robot.speaking .robot-character {
  animation: sam-speaking-bob 0.42s ease-in-out infinite alternate;
}

.hero-robot.speaking .robot-smile {
  animation: sam-mouth-talk 0.28s ease-in-out infinite alternate;
  transform-origin: center;
}

.hero-robot.listening .robot-eye i {
  animation: sam-eye-focus 1s ease-in-out infinite alternate;
}

.hero-robot.thinking .robot-eye i {
  animation: sam-eye-think 1.2s ease-in-out infinite alternate;
}

.hero-robot.speaking .robot-arm-right {
  animation: sam-wave 0.65s ease-in-out infinite alternate;
  transform-origin: top center;
}

.hero-robot .heart-float,
.hero-robot .sparkle {
  pointer-events: none;
}

@keyframes sam-idle-bob {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-8px) rotate(1deg); }
}

@keyframes sam-listening-bob {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-5px) scale(1.015); }
}

@keyframes sam-thinking-tilt {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-4px) rotate(1.5deg); }
}

@keyframes sam-speaking-bob {
  from { transform: translateY(0) scale(1); }
  to { transform: translateY(-4px) scale(1.012); }
}

@keyframes sam-mouth-talk {
  from { transform: scaleY(0.65); }
  to { transform: scaleY(1.35); }
}

@keyframes sam-eye-focus {
  from { transform: translateY(0); }
  to { transform: translateY(2px); }
}

@keyframes sam-eye-think {
  from { transform: translateX(-1px); }
  to { transform: translateX(2px); }
}

@keyframes sam-wave {
  from { transform: rotate(-5deg); }
  to { transform: rotate(10deg); }
}

@media (max-width: 760px) {
  .sam-app {
    width: 100%;
    max-width: 100%;
    padding-left: 8px;
    padding-right: 8px;
    overflow-x: clip;
  }

  .dashboard,
  .robot-column,
  .chat-column,
  .right-panel,
  .robot-scene-card,
  .chat-panel {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  .robot-scene-card {
    min-height: 460px;
    overflow: hidden;
  }

  .hero-robot {
    width: 100%;
    max-width: 100%;
    transform: scale(0.92);
    transform-origin: center bottom;
  }

  .hero-robot .robot-character {
    transform-origin: center bottom;
  }

  .chat-panel {
    height: min(74dvh, 760px);
    min-height: 460px;
    display: flex;
    flex-direction: column;
  }

  .chat-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .chat-composer-area {
    flex: 0 0 auto;
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }

  .chat-composer {
    display: flex;
    gap: 5px;
  }

  .chat-composer > input:not([type="file"]) {
    flex: 1 1 auto;
    width: 0;
    min-width: 0;
  }

  .voice-status {
    align-items: flex-start;
  }

  .voice-language {
    flex: 1 1 125px;
  }

  .voice-language select {
    width: 100%;
  }

  .voice-picker select {
    max-width: 100%;
  }

  .message-content {
    min-width: 0;
    max-width: 100%;
  }

  .message-bubble,
  .message-bubble p {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
}

@media (max-width: 390px) {
  .robot-scene-card {
    min-height: 410px;
  }

  .hero-robot {
    transform: scale(0.82);
  }

  .chat-panel {
    height: 72dvh;
    min-height: 420px;
  }

  .voice-status {
    gap: 6px;
    font-size: 12px;
  }

  .voice-language {
    flex: 1 1 100px;
  }

  .composer-emoji {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-robot .robot-character,
  .hero-robot .robot-smile,
  .hero-robot .robot-eye i,
  .hero-robot .robot-arm-right {
    animation: none !important;
  }
}
'''
Path("/mnt/data/SAM_style_patch.css").write_text(css, encoding="utf-8")

print("Created updated App.jsx and CSS patch.")
