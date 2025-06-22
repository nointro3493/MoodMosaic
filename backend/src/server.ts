import express from "express";
import cors from "cors";
import { Anthropic } from "@anthropic-ai/sdk";
import { getVoiceByEmotion, getAllVoices } from "./voiceConfig.js";

const app = express();
app.use(cors());
app.use(express.json());

// Hardcoded Claude API key (replace with your actual key)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 🔹 Mood classification endpoint
app.post("/get-voice", async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Missing input" });
  }

  try {
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 50,
      temperature: 0.1,
      system: `
You are an emotional classifier for a therapeutic AI assistant. 
Analyze the user's message and detect their emotional state.

Based on the user message, return only ONE of the following emotional labels:

- calm (for general calmness, peace, contentment)
- energetic (for excitement, motivation, enthusiasm)
- sad (for sadness, grief, depression, loneliness)
- happy (for joy, happiness, celebration, positive emotions)
- anxious (for anxiety, stress, worry, nervousness)
- angry (for anger, frustration, irritation)
- empathetic (for when user needs emotional support, vulnerability)
- professional (for serious topics, advice-seeking, formal situations)
- warm (for comfort, reassurance, gentle support)
- soothing (for panic, extreme distress, need for immediate calm)

Consider:
- Direct emotional words (sad, happy, anxious, etc.)
- Context and situation described
- Tone and intensity of the message
- What kind of support the user seems to need

Return only the emotional label - no explanation, no additional text.`,
      messages: [{ role: "user", content: input }],
    });

    const personality = completion.content[0]?.text?.trim().toLowerCase();
    console.log("Detected emotion:", personality);

    if (!personality) {
      console.log("Using default calm voice for unrecognized emotion");
      return res.json({ 
        personality: "calm", 
        voiceId: getVoiceByEmotion("calm"),
        originalDetection: personality 
      });
    }

    const voiceId = getVoiceByEmotion(personality);
    return res.json({ personality, voiceId });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: "Claude API failed" });
  }
});

// 🔹 Claude response generation endpoint
app.post("/get-reply", async (req, res) => {
  const { input, emotion, persona } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Missing input" });
  }

  try {
    const selectedPersona = persona || "therapist";
    
    const completion = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 400,
      temperature: 0.7,
      system: `
You are an AI ${selectedPersona} who adapts your response style based on the user's emotional state.

Current detected emotion: ${emotion || 'calm'}

Adapt your response style according to the emotion:

- calm: Use a gentle, peaceful tone with soft language
- energetic: Be enthusiastic, motivating, and upbeat
- sad: Show deep empathy, warmth, and gentle comfort
- happy: Match their joy with positive energy and celebration
- anxious: Use a very soothing, calming voice with reassurance
- angry: Be firm but understanding, help them process their feelings
- empathetic: Show deep emotional understanding and validation
- professional: Be structured, clear, and solution-focused
- warm: Use comforting, nurturing language
- soothing: Be extremely gentle and calming, like a lullaby

Remember: You are acting as a ${selectedPersona}. Stay in character while adapting to their emotional needs.

Keep responses conversational and natural, around 2-3 sentences.`,
      messages: [{ role: "user", content: input }],
    });

    const reply = completion.content.map(c => c.text).join(" ").trim();
    console.log("Claude reply:", reply);

    return res.json({ reply });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: "Claude API failed" });
  }
});

// 🔹 Get all available voices endpoint
app.get("/voices", (req, res) => {
  try {
    const voices = getAllVoices();
    return res.json({ voices });
  } catch (err) {
    console.error("Error getting voices:", err);
    return res.status(500).json({ error: "Failed to get voices" });
  }
});

// 🔹 Root check
app.get("/", (req, res) => {
  res.send("API is running. Use POST /get-voice or /get-reply, GET /voices.");
});

// 🔹 Start server
app.listen(3001, () => {
  console.log("Backend with Claude running at http://localhost:3001");
});
