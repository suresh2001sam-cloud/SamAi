import React, { useEffect, useRef, useState } from "react";

const suggestions = [
  "Tell me a joke",
  "Explain this in simple terms",
  "Give me study tips",
  "Create a to-do list",
  "Give me a motivational quote"
];

function SamRobot({ mode }) {
  return (
    <div className={`hero-robot ${mode}`}>
      <div className="robot-glow" />
      <span className="heart-float heart-one">♥️</span>
      <span className="heart-float heart-two">♡</span>
      <span className="sparkle sparkle-one">✦</span>
      <span className="sparkle sparkle-two">✧</span>

      <div className="robot-character">
        <div className="robot-antenna"><span /></div>
        <div className="robot-ear left-ear"><i /></div>
        <div className="robot-ear right-ear"><i /></div>

        <div className="robot-head">
          <div className="robot-top-label">SAM <span>✦</span></div>
          <div className="robot-screen">
            <div className="robot-eyes">
              <span className="robot-eye"><i /></span>
              <span className="robot-eye"><i /></span>
            </div>
            <div className="robot-blush"><i /><i /></div>
            <div className="robot-smile" />
          </div>
        </div>

        <div className="robot-neck" />

        <div className="robot-torso">
          <div className="robot-heart">♥️</div>
          <div className="robot-chest-lights"><i /><i /><i /></div>
        </div>

        <div className="robot-arm robot-arm-left">
          <div className="robot-palm"><i /><i /><i /></div>
        </div>
        <div className="robot-arm robot-arm-right">
          <div className="robot-palm" />
        </div>

        <div className="robot-leg robot-leg-left" />
        <div className="robot-leg robot-leg-right" />
        <div className="robot-foot robot-foot-left" />
        <div className="robot-foot robot-foot-right" />
      </div>

      <div className="robot-floor-shadow" />

      <div className="robot-speech-bubble">
        {mode === "listening"
          ? "I'm listening! 🎙️"
          : mode === "thinking"
          ? "Let me think... 💭"
          : mode === "speaking"
          ? "I'm talking! 💜"
          : "Hi there! I'm SAM 💜"}
      </div>
    </div>
  );
}

function Icon({ name }) {
  const paths = {
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" /></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    explore: <><circle cx="12" cy="12" r="10" /><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a8 8 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a8 8 0 0 1 0 1.8z" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" /></>,
    search: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
    sound: <><path d="M11 5 6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className="icon" aria-hidden="true">
      {paths[name] || paths.chat}
    </svg>
  );
}

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceLanguage, setVoiceLanguage] = useState("ta-IN");
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [activeTab, setActiveTab] = useState("Chat");
  const [darkMode, setDarkMode] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const robotMode = listening
    ? "listening"
    : loading
    ? "thinking"
    : speaking
    ? "speaking"
    : "idle";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return undefined;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      setVoiceName((currentName) => {
        if (currentName && voices.some((voice) => voice.name === currentName)) {
          return currentName;
        }

        const languageVoice = voices.find((voice) =>
          voice.lang?.toLowerCase().startsWith(voiceLanguage.toLowerCase())
        );
        return languageVoice?.name || voices[0]?.name || "";
      });
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
      if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [voiceLanguage]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function stopVoice() {
    recognitionRef.current?.abort();
    setListening(false);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  }

  function speakReply(text) {
    if (!voiceEnabled) {
      setVoiceError("Settings-ல் Read SAM replies aloud-ஐ enable செய்யுங்கள்.");
      return;
    }

    if (!("speechSynthesis" in window) || typeof window.SpeechSynthesisUtterance === "undefined") {
      setVoiceError("இந்த browser-ல் text-to-speech support கிடைக்கவில்லை.");
      return;
    }

    window.speechSynthesis.cancel();
    setVoiceError("");

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = voiceLanguage;
    utterance.rate = 0.96;
    utterance.pitch = 1.08;

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((voice) => voice.name === voiceName);
    const languageVoice = voices.find((voice) =>
      voice.lang?.toLowerCase().startsWith(voiceLanguage.toLowerCase())
    );
    const chosenVoice = selectedVoice || languageVoice;

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang || voiceLanguage;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => {
      setSpeaking(false);
      if (event.error !== "canceled" && event.error !== "interrupted") {
        setVoiceError("Voice playback நடக்கவில்லை. Browser voice settings-ஐ சரிபார்க்கவும்.");
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  async function sendText(text) {
    const cleanText = text.trim();
    if (!cleanText || loading) return;

    stopVoice();
    setVoiceError("");
    setMessages((old) => [...old, { role: "user", text: cleanText }]);
    setMessage("");
    setLoading(true);

    try {
      const history = [
        ...messages.map((item) => ({
          role: item.role === "user" ? "user" : "assistant",
          content: item.text
        })),
        { role: "user", content: cleanText }
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
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

  function handleVoiceLanguageChange(nextLanguage) {
    setVoiceLanguage(nextLanguage);
    const matchingVoice = availableVoices.find((voice) =>
      voice.lang?.toLowerCase().startsWith(nextLanguage.toLowerCase())
    );
    if (matchingVoice) setVoiceName(matchingVoice.name);
  }

  function renderVoiceSelector(className = "") {
    return (
      <label className={`voice-picker ${className}`}>
        <span>Voice</span>
        <select
          value={voiceName}
          onChange={(event) => setVoiceName(event.target.value)}
          aria-label="Choose spoken voice"
          disabled={!availableVoices.length}
        >
          {availableVoices.length === 0 && <option value="">Browser default voice</option>}
          {availableVoices.map((voice) => (
            <option key={`${voice.name}-${voice.lang}`} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </label>
    );
  }

  function startListening() {
    setVoiceError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice recognition கிடைக்கவில்லை. Chrome browser-ல் முயற்சி செய்யுங்கள்.");
      return;
    }

    if (loading) return;

    stopVoice();

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) sendText(transcript);
    };

    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone permission Allow செய்யுங்கள். Browser site settings-ல் microphone access-ஐ enable செய்யவும்."
          : event.error === "no-speech"
          ? "குரல் கேட்கவில்லை. Mic அருகில் பேசிவிட்டு மீண்டும் முயற்சி செய்யுங்கள்."
          : event.error === "audio-capture"
          ? "Microphone கண்டுபிடிக்கப்படவில்லை. Mic connection-ஐ சரிபார்க்கவும்."
          : `Voice error: ${event.error}. மீண்டும் முயற்சி செய்யுங்கள்.`
      );
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceError("Microphone start ஆகவில்லை. மீண்டும் முயற்சி செய்யுங்கள்.");
    }
  }

  function runSuggestion(text) {
    setActiveTab("Chat");
    sendText(text);
  }

  function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage((old) =>
      `${old}${old ? "\n" : ""}I selected a file named "${file.name}". Please tell me how to analyze it.`
    );
    setVoiceError("File தேர்வு செய்யப்பட்டது. இந்த version-ல் file upload API இன்னும் இணைக்கப்படவில்லை.");
    event.target.value = "";
  }

  const navItems = [
    { label: "Chat", icon: "chat" },
    { label: "Friends", icon: "people" },
    { label: "Explore", icon: "explore" },
    { label: "Settings", icon: "settings" }
  ];

  return (
    <main className={`sam-app ${darkMode ? "dark-mode" : ""}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-robot">🤖</div>
          <div>
            <h1>SAM AI <span>♥️</span></h1>
            <p>Your Cute AI Buddy</p>
          </div>
        </div>

        <div className="top-search">
          <Icon name="search" />
          <input
            aria-label="Search conversations"
            placeholder="Search conversations, people..."
            onChange={(event) => {
              const value = event.target.value.toLowerCase();
              if (value) setActiveTab("Chat");
            }}
          />
        </div>

        <button className="top-icon" title="Toggle theme" onClick={() => setDarkMode((v) => !v)}>
          <Icon name="sun" />
        </button>

        <button className="top-icon notification" title="Notifications">♧</button>

        <div className="profile-chip">
          <div className="profile-avatar">S</div>
          <div><strong>Sam User</strong><small><i /> Online</small></div>
          <span>⌄</span>
        </div>
      </header>

      <div className="dashboard">
        <aside className="sidebar">
          <nav className="nav-menu">
            {navItems.map((item) => (
              <button
                key={item.label}
                className={`nav-item ${activeTab === item.label ? "selected" : ""}`}
                onClick={() => setActiveTab(item.label)}
              >
                <span className="nav-icon"><Icon name={item.icon} /></span>
                <span>
                  <strong>{item.label}</strong>
                  <small>
                    {item.label === "Chat"
                      ? "Chat with SAM"
                      : item.label === "Friends"
                      ? "Chat with people"
                      : item.label === "Explore"
                      ? "Discover ideas"
                      : "App preferences"}
                  </small>
                </span>
              </button>
            ))}
          </nav>

          <div className="sidebar-online">
            <h3><i /> Online Users (1)</h3>
            <div className="online-user">
              <div className="mini-avatar">S</div>
              <div><strong>Sam User</strong><small>You</small></div>
              <span className="user-online-dot" />
            </div>
            <p className="online-note">
              Friends chat will be enabled when Firebase login and real-time messaging are connected.
            </p>
          </div>

          <div className="sidebar-bottom">
            <span>👑</span>
            <div><strong>SAM AI</strong><small>Always here to help you! 💜</small></div>
          </div>
        </aside>

        <section className="robot-column">
          <div className="robot-scene-card">
            <div className="hero-copy">
              <span>Your Cute AI Buddy</span>
              <h2>Hi there!<br />I'm SAM <b>💜</b></h2>
              <p>How can I help you today?</p>
            </div>

            <SamRobot mode={robotMode} />

            <div className="feature-card feature-ideas">
              <span>💡</span><div><strong>Get Ideas</strong><small>Study, work, coding, creative ideas...</small></div>
            </div>
            <div className="feature-card feature-summary">
              <span>📄</span><div><strong>Summarize</strong><small>Long text and useful notes...</small></div>
            </div>
            <div className="feature-card feature-image">
              <span>🖼️</span><div><strong>Analyze Images</strong><small>Image analysis can be added next.</small></div>
            </div>
            <div className="hero-decoration">♡ ✦ ♡</div>
          </div>
        </section>

        <section className="chat-column">
          <div className="chat-panel">
            <header className="chat-header">
              <div className="chat-avatar">🤖</div>
              <div className="chat-title">
                <h2>SAM AI <span><i /> Online</span></h2>
                <p>Ask me anything... I'm here to help! 😊</p>
              </div>
              <button className="chat-header-button" title="Read latest reply" onClick={() => {
                const last = [...messages].reverse().find((item) => item.role === "Sam");
                if (last) speakReply(last.text);
              }}><Icon name="sound" /></button>
              <button className="chat-header-button" title="Stop voice" onClick={stopVoice}>↻</button>
              <button className="chat-header-button" title="Clear conversation" onClick={() => {
                stopVoice();
                setMessages([]);
              }}>⋮</button>
            </header>

            <div className="chat-body">
              {activeTab !== "Chat" && (
                <div className="feature-notice">
                  <strong>{activeTab}</strong>
                  <p>
                    {activeTab === "Friends"
                      ? "Real-time friend chat needs Firebase Authentication and a messages database. This is the next development phase."
                      : activeTab === "Explore"
                      ? "Use the suggestions on the right to explore SAM's AI capabilities."
                      : "Choose Tamil or English voice and enable or disable spoken replies below."}
                  </p>
                  {activeTab === "Settings" && (
                    <div className="settings-options">
                      <label>
                        Voice language
                        <select value={voiceLanguage} onChange={(event) => handleVoiceLanguageChange(event.target.value)}>
                          <option value="ta-IN">Tamil</option>
                          <option value="en-IN">English (India)</option>
                        </select>
                      </label>
                      {renderVoiceSelector()}
                      <label>
                        <input type="checkbox" checked={voiceEnabled} onChange={(event) => setVoiceEnabled(event.target.checked)} />
                        Read SAM replies aloud
                      </label>
                    </div>
                  )}
                  <button className="small-action" onClick={() => setActiveTab("Chat")}>Back to AI Chat</button>
                </div>
              )}

              {activeTab === "Chat" && messages.length === 0 && (
                <div className="empty-chat">
                  <div className="empty-robot">🤖</div>
                  <h3>Hello! I'm SAM 👋</h3>
                  <p>I'm your AI buddy. I'm happy to see you! 💜</p>
                  <p>What would you like to know or talk about today?</p>
                  <button className="welcome-suggestion" onClick={() => runSuggestion("Introduce yourself in Tamil and English")}>
                    ✨ Say hello to SAM
                  </button>
                </div>
              )}

              {activeTab === "Chat" && messages.map((item, index) => (
                <div key={index} className={`message-row ${item.role === "user" ? "user-row" : "sam-row"}`}>
                  {item.role !== "user" && <div className="message-avatar">🤖</div>}
                  <div className="message-content">
                    <div className="message-meta">
                      <strong>{item.role === "user" ? "You" : "SAM"}</strong>
                      <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="message-bubble"><p>{item.text}</p></div>
                    {item.role !== "user" && (
                      <div className="message-tools">
                        <button title="Read reply aloud" onClick={() => speakReply(item.text)}><Icon name="sound" /> Listen</button>
                        <button title="Copy reply" onClick={() => navigator.clipboard?.writeText(item.text)}>▢ Copy</button>
                      </div>
                    )}
                  </div>
                  {item.role === "user" && <div className="user-message-avatar">S</div>}
                </div>
              ))}

              {loading && (
                <div className="message-row sam-row">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="message-meta"><strong>SAM</strong><span>Thinking...</span></div>
                    <div className="message-bubble typing"><i /><i /><i /></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="chat-composer-area">
              <div className="voice-status">
                <span className={listening ? "pulse-dot" : "status-dot"} />
                {listening
                  ? "Listening — speak now"
                  : speaking
                  ? "SAM is speaking..."
                  : loading
                  ? "SAM is thinking..."
                  : "Ready to chat"}
                <label className="voice-language">
                  <span>Language</span>
                  <select value={voiceLanguage} onChange={(event) => handleVoiceLanguageChange(event.target.value)} disabled={listening}>
                    <option value="ta-IN">தமிழ்</option>
                    <option value="en-IN">English</option>
                  </select>
                </label>
                {renderVoiceSelector()}
              </div>

              {voiceError && <p className="voice-error">{voiceError}</p>}

              <form className="chat-composer" onSubmit={sendMessage}>
                <button type="button" className="composer-attach" title="Choose file" onClick={() => fileInputRef.current?.click()}>
                  <Icon name="plus" />
                </button>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type a message to SAM..."
                  aria-label="Type a message"
                  disabled={loading}
                />
                <button type="button" className="composer-emoji" title="Add heart" onClick={() => setMessage((old) => old + " 💜")}>☺</button>
                <button type="button" className={`composer-mic ${listening ? "mic-active" : ""}`} onClick={listening ? stopVoice : startListening} disabled={loading} title="Speak to SAM">
                  <Icon name="mic" />
                </button>
                <button type="submit" className="composer-send" disabled={loading || !message.trim()} title="Send message">
                  <Icon name="send" />
                </button>
                <input ref={fileInputRef} type="file" hidden accept="image/*,.pdf,.txt,.doc,.docx" onChange={handleFile} />
              </form>

              <div className="quick-prompts">
                <button onClick={() => runSuggestion("Suggest some creative ideas")}>✨ Suggest Ideas</button>
                <button onClick={() => runSuggestion("Explain this in simple terms")}>📝 Explain</button>
                <button onClick={() => runSuggestion("Give me study tips")}>🧠 Study Tips</button>
                <button onClick={() => runSuggestion("Give me a motivational quote")}>💡 Motivation</button>
              </div>
            </div>
          </div>
        </section>

        <aside className="right-panel">
          <section className="right-card">
            <h3>⚡ Quick Actions</h3>
            <button className="quick-action action-blue" onClick={() => { stopVoice(); setMessages([]); setActiveTab("Chat"); }}>
              <span>＋</span> New Chat
            </button>
            <button className="quick-action action-pink" onClick={() => fileInputRef.current?.click()}>
              <span>▧</span> Upload Image
            </button>
            <button className="quick-action action-green" onClick={() => runSuggestion("Help me analyze a document. Ask me to provide its contents.")}>
              <span>▤</span> Analyze File
            </button>
            <button className="quick-action action-yellow" onClick={() => runSuggestion("Explain how to summarize a long document and give me a sample summary.")}>
              <span>☰</span> Get Summary
            </button>
          </section>

          <section className="right-card suggestions-card">
            <h3>💡 Chat Suggestions</h3>
            {suggestions.map((item) => (
              <button key={item} className="suggestion-item" onClick={() => runSuggestion(item)}>
                {item}<span>›</span>
              </button>
            ))}
          </section>

          <section className="right-card voice-card">
            <h3>🎙️ Talk to SAM</h3>
            <p>Speak in Tamil or English. SAM can read its replies aloud.</p>
            <button className={`talk-button ${listening ? "talking" : ""}`} onClick={listening ? stopVoice : startListening} disabled={loading}>
              <Icon name="mic" />
              {listening ? "Stop listening" : "Speak to SAM"}
            </button>
            <button className="play-button" onClick={() => {
              const last = [...messages].reverse().find((item) => item.role === "Sam");
              if (last) speakReply(last.text);
              else setVoiceError("முதலில் SAM-க்கு ஒரு message அனுப்புங்கள்.");
            }}>
              <Icon name="sound" /> Play latest reply
            </button>
          </section>
        </aside>
      </div>

      <footer className="dashboard-footer">
        <span>♥️</span> SAM AI Buddy · Your cute AI companion
        <span className="footer-right">Made for learning, ideas and friendly conversations</span>
      </footer>
    </main>
  );
}