import express from "express";
import cors from "cors";
import { Anthropic } from "@anthropic-ai/sdk";
import { getVoiceByEmotion, getAllVoices, getVoiceDescription } from "./voiceConfig.js";

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 🔹 Emotion detection only
app.post("/get-voice", async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Missing input" });
  }

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      temperature: 0.1,
      system: `
You are an advanced emotional intelligence classifier for a therapeutic AI assistant. 
Your task is to analyze the user's message and determine their emotional state with high precision.

Available emotional categories:
CALM, ENERGETIC, SAD, HAPPY, ANXIOUS, ANGRY, EMPATHETIC, PROFESSIONAL, WARM, SOOTHING

Return ONLY the dominant category in UPPERCASE.
No explanation, no extra words.`,
      messages: [{ role: "user", content: input }],
    });

    const detectedEmotion = completion.content[0]?.type === 'text' 
      ? completion.content[0].text.trim().toLowerCase()
      : '';

    console.log("Claude detected emotion:", detectedEmotion);

    const fallbackEmotion = "calm";
    const emotion = detectedEmotion || fallbackEmotion;
    const voiceId = getVoiceByEmotion(emotion);
    const description = getVoiceDescription(emotion);

    return res.json({ 
      personality: emotion, 
      voiceId,
      description
    });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: "Claude API failed" });
  }
});

// 🔹 DISABLED: No reply generation
app.post("/get-reply", async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Missing input" });
  }

  // 👇 Don't call Claude — just return empty reply
  return res.json({ reply: "" });
});

// 🔹 Get all available voices
app.get("/voices", (req, res) => {
  try {
    const voices = getAllVoices();
    return res.json({ voices });
  } catch (err) {
    console.error("Error getting voices:", err);
    return res.status(500).json({ error: "Failed to get voices" });
  }
});

// 🔹 Root endpoint
app.get("/", (req, res) => {
  res.send("API running — use POST /get-voice, GET /voices.");
});

// 🔹 Start server
app.listen(3001, () => {
  console.log("Backend server running at http://localhost:3001");
});
