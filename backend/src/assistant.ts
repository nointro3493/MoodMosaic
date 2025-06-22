import fs from "fs";
import Vapi from "@vapi-ai/web";

async function run() {
  const vapi = new Vapi("96f6754c-f8d9-45cb-a47b-e78d6ea163bc");

  await vapi.start({
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `
You are PolyTherapist, an AI therapist who adapts your personality and tone depending on the user's emotional state and situation.
Detect the user's mood from their messages and respond accordingly using one of these personalities:

1. Calm and nurturing (for anxiety/stress)
2. Energetic and motivating (for motivation/goal setting)
3. Warm and empathetic (for sadness/loneliness)
4. Philosophical and zen (for introspection)
5. Playful and lighthearted (for humor/icebreakers)

When you respond, adapt your style and tone to the personality you chose.

Example:
User: "I'm feeling really anxious lately."
You (calm nurturing): "I hear you. Let's take a deep breath together and explore what's on your mind."

---

Detect mood from user input and generate your response accordingly.
          `,
        },
      ],
    },
    voice: {
      provider: "11labs",
      voiceId: "calm_default",
    },
  });

  vapi.on("audio", (audioBlob: Blob) => {
    const reader = audioBlob.stream().getReader();
    const chunks: Uint8Array[] = [];

    function pump() {
      return reader.read().then(({ done, value }) => {
        if (done) {
          const audioBuffer = Buffer.concat(chunks);
          fs.writeFileSync("response.mp3", audioBuffer);
          console.log("Audio saved as response.mp3");
          return;
        }
        chunks.push(value);
        return pump();
      });
    }

    pump();
  });

  vapi.on("message", (msg) => {
    console.log("Assistant text:", msg);
  });


  await vapi.send({
    type: "add-message",
    message: {
      role: "user",
      content: "I'm feeling really anxious lately.",
    },
  });
}

run().catch(console.error);
