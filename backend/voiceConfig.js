// Voice configuration for Vapi with associated emotions
export const voiceConfig = {
  // Calm and soothing voices
  calm: {
    voiceId: "f291d7d9-8dee-4b1c-9d09-1826eba2d965",
    description: "Calm and composed voice for general conversations",
    emotions: ["calm", "peaceful", "content", "serene", "tranquil"]
  },
  
  // Energetic and motivating voices
  energetic: {
    voiceId: "04a3829a-0e7f-48ca-934a-0a38d6705507",
    description: "Energetic and motivating voice",
    emotions: ["energetic", "excited", "motivated", "enthusiastic", "pumped", "thrilled"]
  },
  
  // Sad and melancholic voices
  sad: {
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    description: "Soft and melancholic voice for sadness",
    emotions: ["sad", "grief", "depression", "loneliness", "melancholy", "sorrow", "despair"]
  },
  
  // Happy and joyful voices
  happy: {
    voiceId: "AZnzlk1XvdvUeBnXmlld",
    description: "Joyful and positive voice",
    emotions: ["happy", "joy", "celebration", "positive", "cheerful", "elated", "ecstatic"]
  },
  
  // Soothing voices for anxiety
  anxious: {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    description: "Very soothing voice for anxiety",
    emotions: ["anxious", "stress", "worry", "nervous", "panic", "fearful", "overwhelmed"]
  },
  
  // Firm but calm voices
  angry: {
    voiceId: "VR6AewLTigWG4xSOukaG",
    description: "Firm but calm voice for anger",
    emotions: ["angry", "frustration", "irritation", "upset", "furious", "enraged", "annoyed"]
  },
  
  // Empathetic voices
  empathetic: {
    voiceId: "pNInz6obpgDQGcFmaJgB",
    description: "Very empathetic and understanding voice",
    emotions: ["empathetic", "vulnerable", "needs_support", "emotional", "hurt", "broken"]
  },
  
  // Professional voices
  professional: {
    voiceId: "ThT5KcBeYPX3keUQqHPh",
    description: "Professional and structured voice",
    emotions: ["professional", "serious", "advice_seeking", "formal", "business", "analytical"]
  },
  
  // Warm and comforting voices
  warm: {
    voiceId: "yoZ06aMxZJJ28mfd3POQ",
    description: "Warm and comforting voice",
    emotions: ["warm", "comfort", "reassurance", "gentle", "nurturing", "caring", "loving"]
  },
  
  // Extremely soothing voices
  soothing: {
    voiceId: "jBpfuE2KF4XphVdVApVj",
    description: "Extremely soothing voice like a lullaby",
    emotions: ["soothing", "extreme_distress", "panic", "need_calm", "crisis", "emergency"]
  }
};

// Function to get voice by emotion using Claude 4 analysis
export function getVoiceByEmotion(emotion) {
  const normalizedEmotion = emotion.toLowerCase().trim();
  
  // Direct lookup
  if (voiceConfig[normalizedEmotion]) {
    return voiceConfig[normalizedEmotion].voiceId;
  }
  
  // Lookup by associated emotions
  for (const [key, config] of Object.entries(voiceConfig)) {
    if (config.emotions.includes(normalizedEmotion)) {
      return config.voiceId;
    }
  }
  
  // Default fallback
  return voiceConfig.calm.voiceId;
}

// Function to get all available voices
export function getAllVoices() {
  const voices = {};
  for (const [key, config] of Object.entries(voiceConfig)) {
    voices[key] = config.voiceId;
  }
  return voices;
}

// Function to get voice description by emotion
export function getVoiceDescription(emotion) {
  const normalizedEmotion = emotion.toLowerCase().trim();
  
  if (voiceConfig[normalizedEmotion]) {
    return voiceConfig[normalizedEmotion].description;
  }
  
  return voiceConfig.calm.description;
} 