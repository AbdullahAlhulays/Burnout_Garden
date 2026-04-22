const FALLBACK_RECOMMENDATIONS = [
  "Keep your routine balanced",
  "Maintain healthy habits",
  "Stay consistent daily",
];

function extractPercentage(item) {
  if (typeof item !== "string") return null;

  const match = item.match(/:\s*(\d{1,3})%/);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;

  return Math.max(0, Math.min(100, value));
}

function normalizeInput(data) {
  if (!Array.isArray(data)) return [];

  return data
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => ({
      raw: item,
      percentage: extractPercentage(item),
    }))
    .filter((item) => item.percentage !== null)
    .filter((item) => item.percentage >= 40)
    .sort((a, b) => b.percentage - a.percentage)
    .map((item) => item.raw);
}

function normalizeRecommendations(value) {
  if (!Array.isArray(value)) return FALLBACK_RECOMMENDATIONS;

  const cleaned = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return cleaned.length === 3 ? cleaned : FALLBACK_RECOMMENDATIONS;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;

  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }

  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const filteredItems = normalizeInput(body?.data);

    if (!Array.isArray(body?.data)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    if (!filteredItems.length) {
      return res.status(200).json({
        recommendations: FALLBACK_RECOMMENDATIONS,
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-nano",
        input: [
          {
            role: "system",
            content:
              "Burnout assistant. Return JSON only. 3 recommendations. Max 10 words each",
          },
          {
            role: "user",
            content: filteredItems.join(", "),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "burnout_recommendations",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                recommendations: {
                  type: "array",
                  minItems: 3,
                  maxItems: 3,
                  items: {
                    type: "string",
                  },
                },
              },
              required: ["recommendations"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({
        error: "OpenAI request failed",
        details: errorText,
        recommendations: FALLBACK_RECOMMENDATIONS,
      });
    }

    const result = await response.json();

    let parsed = null;

    if (typeof result.output_text === "string" && result.output_text.trim()) {
      try {
        parsed = JSON.parse(result.output_text);
      } catch {}
    }

    if (!parsed && Array.isArray(result.output)) {
      for (const outputItem of result.output) {
        const contentItems = Array.isArray(outputItem?.content)
          ? outputItem.content
          : [];

        for (const contentItem of contentItems) {
          if (typeof contentItem?.text === "string" && contentItem.text.trim()) {
            try {
              parsed = JSON.parse(contentItem.text);
              break;
            } catch {}
          }
        }

        if (parsed) break;
      }
    }

    return res.status(200).json({
      recommendations: normalizeRecommendations(parsed?.recommendations),
    });
  } catch {
    return res.status(500).json({
      error: "Internal server error",
      recommendations: FALLBACK_RECOMMENDATIONS,
    });
  }
}

