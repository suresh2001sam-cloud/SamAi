import React, { useState } from "react";

function SamRobot({ thinking, happy }) {
  return (
    <div
      className={`robot-scene ${thinking ? "thinking" : ""} ${
        happy ? "happy" : ""
      }`}
      aria-label={thinking ? "SAM is thinking" : "SAM robot"}
      role="img"
    >
      <div className="robot-spark spark-one">✦</div>
      <div className="robot-spark spark-two">✧</div>

      <div className="robot">
        <div className="robot-antenna">
          <span />
        </div>

        <div className="robot-ear ear-left" />
        <div className="robot-ear ear-right" />

        <div className="robot-head">
          <div className="robot-forehead">
            <span className="forehead-light" />
            <span>SAM</span>
          </div>

          <div className="robot-face">
            <div className="robot-eyes">
              <span className="robot-eye">
                <i />
              </span>
              <span className="robot-eye">
                <i />
              </span>
            </div>

            <div className="robot-cheeks">
              <span />
              <span />
            </div>

            <div className="robot-mouth">
              <span />
            </div>
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

        <div className="robot-arm arm-left">
          <span className="robot-hand" />
        </div>
        <div className="robot-arm arm-right">
          <span className="robot-hand" />
        </div>

        <div className="robot-leg leg-left" />
        <div className="robot-leg leg-right" />
        <div className="robot-foot foot-left" />
        <div className="robot-foot foot-right" />
      </div>

      <div className="robot-shadow" />

      <div className="robot-status">
        <span className="status-dot" />
        {thinking
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

  async function sendMessage(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    setMessages((old) => [...old, { role: "user", text }]);
    setMessage("");
    setLoading(true);
    setHappy(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((item) => ({
              role: item.role === "user" ? "user" : "assistant",
              content: item.text
            })),
            {
              role: "user",
              content: text
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI reply failed");
      }

      const reply =
        data.choices?.[0]?.message?.content ||
        data.reply ||
        "SAM could not reply. Please try again.";

      setMessages((old) => [...old, { role: "Sam", text: reply }]);
      setHappy(true);
    } catch (error) {
      console.error("SAM chat error:", error);

      setMessages((old) => [
        ...old,
        {
          role: "Sam",
          text:
            error.message ||
            "SAM connection இன்னும் சரியாகவில்லை. மீண்டும் முயற்சி செய்யுங்கள்."
        }
      ]);
    } finally {
      setLoading(false);
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
        <div className="online-badge">
          <span />
          Online
        </div>
      </header>

      <section className="workspace">
        <aside className="robot-panel">
          <div className="robot-welcome">
            <span className="welcome-pill">YOUR AI FRIEND</span>
            <h2>Hi, I'm SAM!</h2>
            <p>
              உங்களுடன் பேசவும், கேள்விகளுக்கு பதில் சொல்லவும்
              நான் தயாராக இருக்கிறேன்.
            </p>
          </div>

          <SamRobot thinking={loading} happy={happy} />

          <div className="robot-tip">
            <span>💡</span>
            <p>எதுவாக இருந்தாலும் என்னிடம் கேளுங்கள்!</p>
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-heading">
            <div className="chat-avatar">🤖</div>
            <div>
              <h2>SAM</h2>
              <p>{loading ? "Thinking..." : "Always here to help"}</p>
            </div>
            <span className="chat-menu">•••</span>
          </div>

          <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-icon">👋</div>
                <h3>Hey there!</h3>
                <p>
                  I'm SAM, your AI buddy. Start a conversation with me.
                </p>

                <div className="suggestion-list">
                  <button
                    type="button"
                    onClick={() => setMessage("Introduce yourself")}
                  >
                    ✨ Introduce yourself
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage("Tell me something interesting")}
                  >
                    🌟 Tell me something interesting
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage("தமிழில் பேசலாமா?")}
                  >
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
                {item.role !== "user" && (
                  <div className="message-avatar">🤖</div>
                )}

                <div className="message-bubble">
                  <strong>
                    {item.role === "user" ? "You" : "SAM"}
                  </strong>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message-row sam-row">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble typing-bubble">
                  <strong>SAM</strong>
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                    <small>Thinking</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form className="chat-form" onSubmit={sendMessage}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message SAM..."
              aria-label="Message SAM"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
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
