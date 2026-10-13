import React, { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();

    const text = message.trim();
    if (!text || loading) return;

    setMessages((old) => [
      ...old,
      { role: "user", text }
    ]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
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

      const reply = data.choices?.[0]?.message?.content
        || data.reply
        || "Sam could not reply. Please try again.";

      setMessages((old) => [
        ...old,
        { role: "Sam", text: reply }
      ]);
    } catch (error) {
      setMessages((old) => [
        ...old,
        {
          role: "Sam",
          text: "AI connection இன்னும் சரியாகவில்லை. அமைப்புகளைச் சரிபார்க்கவும்."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <h1>🤖 Sam AI Buddy 💜</h1>
      <p>உங்கள் புதிய AI நண்பன்!</p>

      <div>
        {messages.map((item, index) => (
          <div className="message" key={index}>
            <strong>
              {item.role === "user" ? "நீங்கள்" : "Sam"}:
            </strong>
            <p>{item.text}</p>
          </div>
        ))}

        {loading && <p>🤖 Sam பதில் யோசிக்கிறது...</p>}
      </div>

      <form onSubmit={sendMessage}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Sam-விடம் ஏதாவது கேளுங்கள்..."
          disabled={loading}
        />
        {" "}
        <button type="submit" disabled={loading}>
          அனுப்பு
        </button>
      </form>
    </div>
  );
}
