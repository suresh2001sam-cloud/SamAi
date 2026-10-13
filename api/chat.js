export default async function handler(req, res) {
  console.log("SAM API CALLED:", req.method, req.url);

  // Allow POST requests only
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // Read API key from Vercel Environment Variables
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return res.status(500).json({
      error: "GROQ_API_KEY missing. Check Vercel Environment Variables."
    });
  }

  try {
    const messages = req.body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "No messages received from the website."
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
            process.env.GROQ_MODEL || "openai/gpt-oss-120b",
          messages: messages,
          temperature: 0.7
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    // Handle Groq API errors
    if (!response.ok) {
      const status = response.status;

      console.error("Groq API Error:", status, data);

      let message =
        data.error?.message || "Groq AI request failed.";

      if (status === 401) {
        message =
          "Invalid Groq API key. Check GROQ_API_KEY in Vercel.";
      } else if (status === 403) {
        message =
          "Groq access denied. Check your account and API permissions.";
      } else if (status === 404) {
        message =
          "Groq model or endpoint not found. Check the model name.";
      } else if (status === 429) {
        message =
          "Groq rate limit or quota reached. Check your usage.";
      }

      return res.status(status).json({
        error: message
      });
    }

    // Return AI response to the website
    return res.status(200).json(data);

  } catch (error) {
    console.error("SAM AI API error:", error);

    return res.status(500).json({
      error: "Server error while connecting to Groq AI."
    });
  }
}

