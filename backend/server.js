import express from "express";
import cors from "cors";
import { Anthropic } from "@anthropic-ai/sdk";
import { getVoiceByEmotion, getAllVoices, getVoiceDescription } from "./voiceConfig.js";

const app = express();
app.use(cors());
app.use(express.json());

// Hardcoded Claude API key (replace with your actual key)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 🔹 Advanced emotion classification endpoint using Claude 4
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

Available emotional categories and their characteristics:

1. CALM: Peaceful, content, serene, relaxed, balanced, at ease
2. ENERGETIC: Excited, motivated, enthusiastic, pumped, thrilled, energized
3. SAD: Sad, grief, depression, loneliness, melancholy, sorrow, despair, hopeless
4. HAPPY: Joy, happiness, celebration, positive, cheerful, elated, ecstatic, grateful
5. ANXIOUS: Anxiety, stress, worry, nervous, panic, fearful, overwhelmed, tense
6. ANGRY: Anger, frustration, irritation, upset, furious, enraged, annoyed, resentful
7. EMPATHETIC: Needs emotional support, vulnerable, hurt, broken, seeking comfort
8. PROFESSIONAL: Serious topics, advice-seeking, formal, business, analytical, focused
9. WARM: Seeking comfort, reassurance, gentle support, nurturing, caring
10. SOOTHING: Extreme distress, crisis, emergency, panic, need immediate calm

Analysis Guidelines:
- Consider the overall context and tone, not just individual words
- Look for emotional intensity and urgency
- Consider what type of support the user seems to need
- Analyze both explicit emotional words and implicit emotional cues
- Consider cultural and contextual factors
- Look for mixed emotions and choose the dominant one

Return only the emotional category in UPPERCASE - no explanation, no additional text.`,
      messages: [{ role: "user", content: input }],
    });

    const detectedEmotion = completion.content[0]?.type === 'text' 
      ? completion.content[0].text.trim().toLowerCase()
      : '';
    console.log("Claude 4 detected emotion:", detectedEmotion);

    if (!detectedEmotion) {
      console.log("Using default calm voice for unrecognized emotion");
      return res.json({ 
        personality: "calm", 
        voiceId: getVoiceByEmotion("calm"),
        originalDetection: detectedEmotion,
        description: getVoiceDescription("calm")
      });
    }

    const voiceId = getVoiceByEmotion(detectedEmotion);
    const description = getVoiceDescription(detectedEmotion);
    
    return res.json({ 
      personality: detectedEmotion, 
      voiceId,
      description
    });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: "Claude API failed" });
  }
});

// 🔹 Enhanced response generation endpoint
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

- CALM: Use a gentle, peaceful tone with soft language and balanced perspective
- ENERGETIC: Be enthusiastic, motivating, and upbeat with positive energy
- SAD: Show deep empathy, warmth, and gentle comfort with understanding
- HAPPY: Match their joy with positive energy and celebration of their feelings
- ANXIOUS: Use a very soothing, calming voice with reassurance and grounding techniques
- ANGRY: Be firm but understanding, help them process their feelings constructively
- EMPATHETIC: Show deep emotional understanding and validation of their experience
- PROFESSIONAL: Be structured, clear, and solution-focused with practical guidance
- WARM: Use comforting, nurturing language with gentle support
- SOOTHING: Be extremely gentle and calming, like a lullaby, with immediate comfort

Remember: You are acting as a ${selectedPersona}. Stay in character while adapting to their emotional needs.

Keep responses conversational and natural, around 2-3 sentences. Focus on emotional support and understanding.`,
      messages: [{ role: "user", content: input }],
    });

    const reply = completion.content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join(" ")
      .trim();
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
  console.log("Backend with Claude 4 running at http://localhost:3001");
}); 