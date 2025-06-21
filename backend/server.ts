// backend/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Anthropic } from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });


const voiceMap: Record<string, string> = {
  calm: "calm_default",
  energetic: "energetic_voice_id",
  empathetic: "empathetic_voice_id",
  philosophical: "zen_voice_id",
  playful: "playful_voice_id",
};

app.post("/get-voice", async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Missing input" });
  }

  try {
    const completion = await anthropic.messages.create({
      model: "claude-4",
      max_tokens: 20,
      temperature: 0.2,
      system: `
You are a classifier for a therapeutic AI. 
Based on the user message, return only ONE of the following moods:

- calm (for anxiety/stress)
- energetic (for motivation)
- empathetic (for sadness)
- philosophical (for introspection)
- playful (for humor/light-heartedness)

Just return the personality label only — no sentence, no explanation.`,
      messages: [
        {
          role: "user",
          content: input,
        },
      ],
    });

    const personality = completion.content[0]?.text?.trim().toLowerCase();

    if (!personality || !voiceMap[personality]) {
      return res.status(400).json({ error: "Could not determine personality" });
    }

    const voiceId = voiceMap[personality];
    return res.json({ personality, voiceId });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({ error: "Claude API failed" });
  }
});

app.listen(3001, () => {
  console.log("Backend with Claude running at http://localhost:3001");
});
