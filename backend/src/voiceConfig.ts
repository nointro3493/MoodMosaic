// Configuration des voix Vapi avec leurs émotions associées
export const voiceConfig = {
  // Voix calmes et apaisantes
  calm: {
    voiceId: "f291d7d9-8dee-4b1c-9d09-1826eba2d965",
    description: "Voix calme et posée pour les conversations générales",
    emotions: ["calm", "peaceful", "content"]
  },
  
  // Voix énergiques et motivantes
  energetic: {
    voiceId: "04a3829a-0e7f-48ca-934a-0a38d6705507",
    description: "Voix énergique et motivante",
    emotions: ["energetic", "excited", "motivated", "enthusiastic"]
  },
  
  // Voix tristes et mélancoliques
  sad: {
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    description: "Voix douce et mélancolique pour la tristesse",
    emotions: ["sad", "grief", "depression", "loneliness", "melancholy"]
  },
  
  // Voix joyeuses
  happy: {
    voiceId: "AZnzlk1XvdvUeBnXmlld",
    description: "Voix joyeuse et positive",
    emotions: ["happy", "joy", "celebration", "positive", "cheerful"]
  },
  
  // Voix apaisantes pour l'anxiété
  anxious: {
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    description: "Voix très apaisante pour l'anxiété",
    emotions: ["anxious", "stress", "worry", "nervous", "panic"]
  },
  
  // Voix ferme mais calme
  angry: {
    voiceId: "VR6AewLTigWG4xSOukaG",
    description: "Voix ferme mais calme pour la colère",
    emotions: ["angry", "frustration", "irritation", "upset"]
  },
  
  // Voix empathique
  empathetic: {
    voiceId: "pNInz6obpgDQGcFmaJgB",
    description: "Voix très empathique et compréhensive",
    emotions: ["empathetic", "vulnerable", "needs_support", "emotional"]
  },
  
  // Voix professionnelle
  professional: {
    voiceId: "ThT5KcBeYPX3keUQqHPh",
    description: "Voix professionnelle et structurée",
    emotions: ["professional", "serious", "advice_seeking", "formal"]
  },
  
  // Voix chaleureuse
  warm: {
    voiceId: "yoZ06aMxZJJ28mfd3POQ",
    description: "Voix chaleureuse et réconfortante",
    emotions: ["warm", "comfort", "reassurance", "gentle"]
  },
  
  // Voix très apaisante
  soothing: {
    voiceId: "jBpfuE2KF4XphVdVApVj",
    description: "Voix extrêmement apaisante comme une berceuse",
    emotions: ["soothing", "extreme_distress", "panic", "need_calm"]
  }
};

// Fonction pour obtenir la voix par émotion
export function getVoiceByEmotion(emotion: string): string {
  const normalizedEmotion = emotion.toLowerCase().trim();
  
  // Recherche directe
  if (voiceConfig[normalizedEmotion as keyof typeof voiceConfig]) {
    return voiceConfig[normalizedEmotion as keyof typeof voiceConfig].voiceId;
  }
  
  // Recherche par émotions associées
  for (const [key, config] of Object.entries(voiceConfig)) {
    if (config.emotions.includes(normalizedEmotion)) {
      return config.voiceId;
    }
  }
  
  // Retour par défaut
  return voiceConfig.calm.voiceId;
}

// Fonction pour obtenir toutes les voix disponibles
export function getAllVoices(): Record<string, string> {
  const voices: Record<string, string> = {};
  for (const [key, config] of Object.entries(voiceConfig)) {
    voices[key] = config.voiceId;
  }
  return voices;
} 