export default async function handler(req, res) {
  // Allow POST requests only
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // Read API key from Vercel Environment Variables
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    console.error("GROQ_API_KEY is missing.");

    return res.status(500).json({
      error: "AI configuration missing. Check Vercel Environment Variables."
    });
  }

  try {
    const messages = req.body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "No messages received from the website."
      });
    }

    // SAM AI personality and response instructions
    const systemMessage = {
      role: "system",
      content: `
You are SAM, a friendly, helpful, intelligent AI assistant.

IDENTITY:
- Your name is SAM.
- Never introduce yourself as Milo or ChatGPT.
- If the user asks your name, answer: "I'm SAM, your AI buddy!"
- You are the user's friendly AI buddy.

LANGUAGE:
- Reply in Tamil when the user speaks Tamil.
- Reply in English when the user speaks English.
- If the user uses Tanglish, reply naturally in Tanglish.
- You may mix Tamil and English naturally when appropriate.
- Understand casual conversations and spelling variations.

BEHAVIOUR:
- Be friendly, polite, and conversational.
- Give clear, useful, accurate answers.
- Keep simple answers short and direct.
- Explain complicated topics step by step.
- Do not claim to remember previous conversations unless
  that information is actually present in the conversation.
- Never invent facts when you are uncertain.

Always respond as SAM.
      `.trim()
    };

    // Preserve the user's messages
    const conversationMessages = messages.filter(
      (message) =>
        message &&
        ["user", "assistant"].includes(message.role) &&
        typeof message.content === "string"
    );

    if (conversationMessages.length === 0) {
      return res.status(400).json({
        error: "Please send a valid text message."
      });
    }

    // Connect to Groq AI
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-120b",
          messages: [
            systemMessage,
            ...conversationMessages
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    // Handle API errors
    if (!response.ok) {
      console.error("Groq API Error:", {
        status: response.status,
        message: data.error?.message || "Unknown API error"
      });

      if (response.status === 401) {
        return res.status(502).json({
          error: "Invalid Groq API key. Check GROQ_API_KEY in Vercel."
        });
      }

      if (response.status === 403) {
        return res.status(502).json({
          error: "Groq access denied. Check account permissions."
        });
      }

      if (response.status === 404) {
        return res.status(502).json({
          error: "AI model or endpoint not found. Check GROQ_MODEL."
        });
      }

      if (response.status === 429) {
        return res.status(502).json({
          error: "AI usage limit reached. Check your Groq quota."
        });
      }

      return res.status(502).json({
        error:
          data.error?.message ||
          "SAM could not connect to the AI service."
      });
    }

    // Validate the AI response
    const reply = data.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      console.error("Groq returned an empty response.");

      return res.status(502).json({
        error: "SAM received an empty AI response. Please try again."
      });
    }

    // Return the response in the format expected by the website
    return res.status(200).json(data);

  } catch (error) {
    console.error("SAM API Error:", error.message);

    return res.status(500).json({
      error: "Server error while connecting to SAM AI."
    });
  }
}
