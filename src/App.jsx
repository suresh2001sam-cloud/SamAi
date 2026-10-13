import React, { useEffect, useRef, useState } from "react";

function SamRobot({ thinking, happy, listening }) {
  return (
    <div
      className={`robot-scene ${thinking ? "thinking" : ""} ${
        happy ? "happy" : ""
      } ${listening ? "listening" : ""}`}
      role="img"
      aria-label="SAM AI robot"
    >
      <div className="robot-spark spark-one">✦</div>
      <div className="robot-spark spark-two">♡</div>

      <div className="robot">
        <div className="robot-antenna"><span /></div>
        <div className="robot-ear ear-left" />
        <div className="robot-ear ear-right" />

        <div className="robot-head">
          <div className="robot-forehead">
            <span className="forehead-light" />
            <span>SAM</span>
          </div>

          <div className="robot-face">
            <div className="robot-eyes">
              <span className="robot-eye"><i /></span>
              <span className="robot-eye"><i /></span>
            </div>
            <div className="robot-cheeks"><span /><span /></div>
            <div className="robot-mouth"><span /></div>
          </div>
        </div>

        <div className="robot-neck" />

        <div className="robot-body">
          <div className="robot-chest">
            <span className="chest-light" />
            <span className="chest-light" />
            <span className="chest-light" />
          </div>
          <div className="robot-badge">♥</div>
        </div>

        <div className="robot-arm arm-left"><span className="robot-hand" /></div>
        <div className="robot-arm arm-right"><span className="robot-hand" /></div>
        <div className="robot-leg leg-left" />
        <div className="robot-leg leg-right" />
        <div className="robot-foot foot-left" />
        <div className="robot-foot foot-right" />
      </div>

      <div className="robot-shadow" />
      <div className="robot-status">
        <span className="status-dot" />
        {listening
          ? "SAM is listening..."
          : thinking
          ? "SAM is thinking..."
          : happy
          ? "Happy to help!"
          : "Your AI Buddy"}
      </div>
    </div>
  );
}

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [happy, setHappy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState("ta-IN");
  const [voiceError, setVoiceError] = useState("");

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speakReply(text) {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const hasTamil = /[\u0B80-\u0BFF]/.test(text);
    utterance.lang = hasTamil ? "ta-IN" : "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1.08;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((voice) =>
      hasTamil
        ? voice.lang.toLowerCase().startsWith("ta")
        : voice.lang.toLowerCase().startsWith("en-in")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }

  function stopVoice() {
    recognitionRef.current?.stop();
    setListening(false);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  }

  async function sendText(text) {
    const cleanText = text.trim();
    if (!cleanText || loading) return;

    stopVoice();
    setVoiceError("");
    setMessages((old) => [...old, { role: "user", text: cleanText }]);
    setMessage("");
    setLoading(true);
    setHappy(false);

    try {
      const conversation = [
        ...messages.map((item) => ({
          role: item.role === "user" ? "user" : "assistant",
          content: item.text
        })),
        { role: "user", content: cleanText }
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: conversation })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "SAM AI reply failed.");
      }

      const reply =
        data.choices?.[0]?.message?.content ||
        data.reply ||
        "SAM could not reply. Please try again.";

      setMessages((old) => [...old, { role: "Sam", text: reply }]);
      setHappy(true);
      speakReply(reply);
    } catch (error) {
      console.error("SAM chat error:", error);

      setMessages((old) => [
        ...old,
        {
          role: "Sam",
          text: error.message || "SAM connection failed. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function sendMessage(event) {
    event.preventDefault();
    sendText(message);
  }

  function startListening() {
    setVoiceError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        "Voice recognition இந்த browser-ல் கிடைக்கவில்லை. Chrome-ல் முயற்சி செய்யுங்கள்."
      );
      return;
    }

    if (loading) {
      setVoiceError("SAM பதில் சொல்லி முடித்ததும் பேசலாம்.");
      return;
    }

    stopVoice();

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceError("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();

      if (transcript) {
        setMessage(transcript);
        sendText(transcript);
      }
    };

    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "not-allowed"
          ? "Microphone permission கொடுக்கவும்."
          : event.error === "no-speech"
          ? "குரல் கேட்கவில்லை. மீண்டும் முயற்சி செய்யுங்கள்."
          : `Voice error: ${event.error}`
      );
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      setVoiceError("Microphone start ஆகவில்லை. மீண்டும் முயற்சி செய்யுங்கள்.");
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <div className="header-logo">🤖</div>
        <div>
          <h1>SAM AI Buddy <span>💜</span></h1>
          <p>உங்கள் குட்டி AI நண்பன்!</p>
        </div>
        <div className="online-badge"><span /> Online</div>
      </header>

      <section className="workspace">
        <aside className="robot-panel">
          <div className="robot-welcome">
            <span className="welcome-pill">YOUR AI FRIEND</span>
            <h2>Hi, I'm SAM!</h2>
            <p>என்னிடம் பேசுங்கள். நான் கேட்டு பதில் சொல்கிறேன்!</p>
          </div>

          <SamRobot
            thinking={loading || speaking}
            happy={happy}
            listening={listening}
          />

          <div className="robot-tip">
            <span>🎙️</span>
            <p>Mic அழுத்திப் பேசுங்கள். SAM voice-ல் பதில் சொல்லும்.</p>
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-heading">
            <div className="chat-avatar">🤖</div>
            <div>
              <h2>SAM</h2>
              <p>
                {listening
                  ? "Listening to you..."
                  : speaking
                  ? "SAM is speaking..."
                  : loading
                  ? "Thinking..."
                  : "Always here to help"}
              </p>
            </div>
            <button
              type="button"
              className={`voice-toggle ${voiceEnabled ? "active" : ""}`}
              onClick={() => {
                setVoiceEnabled((enabled) => !enabled);
                if (voiceEnabled) stopVoice();
              }}
              title={voiceEnabled ? "Turn voice off" : "Turn voice on"}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>
          </div>

          <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">👋</div>
                <h3>Hey there!</h3>
                <p>I'm SAM, your AI buddy. Type or speak to start chatting.</p>
                <div className="suggestion-list">
                  <button type="button" onClick={() => setMessage("Introduce yourself")}>
                    ✨ Introduce yourself
                  </button>
                  <button type="button" onClick={() => setMessage("Tell me something interesting")}>
                    🌟 Tell me something interesting
                  </button>
                  <button type="button" onClick={() => setMessage("தமிழில் பேசலாமா?")}>
                    💜 தமிழில் பேசலாமா?
                  </button>
                </div>
              </div>
            )}

            {messages.map((item, index) => (
              <div
                className={`message-row ${
                  item.role === "user" ? "user-row" : "sam-row"
                }`}
                key={index}
              >
                {item.role !== "user" && <div className="message-avatar">🤖</div>}
                <div className="message-bubble">
                  <strong>{item.role === "user" ? "You" : "SAM"}</strong>
                  <p>{item.text}</p>
                  {item.role !== "user" && (
                    <button
                      type="button"
                      className="replay-button"
                      onClick={() => speakReply(item.text)}
                      title="Play this reply"
                    >
                      🔊 Play reply
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row sam-row">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble">
                  <strong>SAM</strong>
                  <div className="typing-indicator">
                    <span /><span /><span />
                    <small>Thinking</small>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="voice-controls">
            <label htmlFor="voice-language">Speech language</label>
            <select
              id="voice-language"
              value={voiceLanguage}
              onChange={(event) => setVoiceLanguage(event.target.value)}
              disabled={listening}
            >
              <option value="ta-IN">தமிழ்</option>
              <option value="en-IN">English</option>
            </select>

            <button
              type="button"
              className={`mic-button ${listening ? "is-listening" : ""}`}
              onClick={listening ? stopVoice : startListening}
              disabled={loading}
            >
              {listening ? "■ Stop listening" : "🎙️ Speak to SAM"}
            </button>

            {(speaking || listening) && (
              <button type="button" className="stop-button" onClick={stopVoice}>
                Stop
              </button>
            )}
          </div>

          {voiceError && (
            <p className="voice-error" role="alert">{voiceError}</p>
          )}

          <form className="chat-form" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message SAM or tap the mic..."
              aria-label="Message SAM"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()}>
              {loading ? "..." : "➤"}
            </button>
          </form>

          <p className="chat-disclaimer">
            SAM AI can make mistakes. Please verify important information.
          </p>
        </section>
      </section>

      <footer className="app-footer">
        Made with <span>♥</span> for you · SAM AI Buddy
      </footer>
    </main>
  );
}
