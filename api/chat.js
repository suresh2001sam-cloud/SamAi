export default async function handler(req, res) {
 console.log("SAM API CALLED:", req.method, req.url, "BODY:", JSON.stringify(req.body));
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

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

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          messages,
          temperature: 0.7
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const status = response.status;

      let message =
        data.error?.message || "Groq AI request failed.";

      if (status === 401) {
        message =
          "Groq rejected the API key (401). Create a valid key in Groq Console, save it as GROQ_API_KEY in Vercel, then redeploy.";
      } else if (status === 403) {
        message =
          "Groq access denied (403). Check your account and API access.";
      } else if (status === 429) {
        message =
          "Groq rate limit or quota reached (429). Check your usage and limits.";
      }

      return res.status(status).json({ error: message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("SAM AI API error:", error);

    return res.status(500).json({
      error: "Server error while connecting to Groq AI."
    });
  }
}
