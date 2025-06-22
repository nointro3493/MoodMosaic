import express from "express";
import cors from "cors";
import { Anthropic } from "@anthropic-ai/sdk";
import {
  getVoiceByEmotion,
  getAllVoices,
  getVoiceDescription,
} from "./voiceConfig.js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Anthropic client
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 🔹 Emotion Detection Endpoint
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

Return ONLY the dominant category in UPPERCASE. No explanation.`,
      messages: [{ role: "user", content: input }],
    });

    const detectedEmotion =
      typeof completion?.content === "string"
        ? completion.content.trim().toLowerCase()
        : "";

    console.log("🧠 Claude detected emotion:", detectedEmotion);

    const emotion = detectedEmotion || "calm";
    const voiceId = getVoiceByEmotion(emotion);
    const description = getVoiceDescription(emotion);

    return res.json({
      personality: emotion,
      voiceId,
      description,
    });
  } catch (err) {
    console.error("❌ Claude API error in /get-voice:", err);
    return res.status(500).json({ error: "Claude API failed" });
  }
});

// 🔹 AI Response Endpoint with full context
app.post("/get-reply", async (req, res) => {
  const { input, emotion, persona, feeling, topic } = req.body;

  if (!input) {
    console.log("❌ Missing input to /get-reply");
    return res.status(400).json({ error: "Missing input" });
  }

  console.log("📥 /get-reply received:", {
    input,
    emotion,
    persona,
    feeling,
    topic,
  });

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      temperature: 0.7,
      system: `
You are an emotionally intelligent ${persona} in a live voice therapy conversation.

The user is currently feeling: "${feeling}".
They want to talk about: "${topic}".
You are speaking in a tone described as: "${emotion}".

Respond empathetically, supportively, and concisely.
Speak naturally, like you're continuing a voice conversation. Avoid greetings or sign-offs.
`.trim(),
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
    });

    // 🔍 DEBUG: print raw Claude response
    console.log("🧠 Claude raw response:", JSON.stringify(completion, null, 2));

    // 🧠 Extract reply safely
    const reply =
      typeof completion?.content === "string" ? completion.content.trim() : "";

    console.log("📤 Claude replied with:", reply);

    return res.json({ reply });
  } catch (err) {
    console.error("❌ Claude API error in /get-reply:", err);
    return res.status(500).json({ error: "Claude reply failed" });
  }
});

// 🔹 Voice listing
app.get("/voices", (req, res) => {
  try {
    const voices = getAllVoices();
    return res.json({ voices });
  } catch (err) {
    console.error("❌ Error getting voices:", err);
    return res.status(500).json({ error: "Failed to get voices" });
  }
});

// 🔹 Health check
app.get("/", (req, res) => {
  res.send(
    "✅ API is running. Endpoints: POST /get-voice, POST /get-reply, GET /voices."
  );
});

// 🔹 Start the server
app.listen(3001, () => {
  console.log("🚀 Server listening on http://localhost:3001");
});
