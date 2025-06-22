# MoodMosaic - Dynamic Voice System

MoodMosaic is a therapeutic application that uses AI to dynamically adapt the assistant's voice based on the user's emotional state.

## Features

### 🎭 Dynamic Voices
The system automatically analyzes user messages and changes the assistant's voice according to the detected emotion:

- **Calm**: Soothing voice for general conversations
- **Energetic**: Motivating voice for enthusiasm
- **Sad**: Soft and melancholic voice for sadness
- **Happy**: Joyful voice for positive emotions
- **Anxious**: Very soothing voice for anxiety
- **Angry**: Firm but calm voice for anger
- **Empathetic**: Very understanding voice
- **Professional**: Structured voice for serious topics
- **Warm**: Warm and comforting voice
- **Soothing**: Extremely soothing voice

### 🤖 Emotional Analysis
- Uses Claude 4 AI for sophisticated emotional context analysis
- Automatically detects the dominant emotion
- Adapts response style according to the emotion
- Considers context, tone, and implicit emotional cues

## Installation

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Configuration

### Environment Variables
Create a `.env` file in the `backend` folder:
```env
ANTHROPIC_API_KEY=your_claude_api_key
```

### Vapi Voices
Voice IDs are configured in `backend/src/voiceConfig.ts`. You can modify them according to your needs.

## Usage

### Start the backend
```bash
cd backend
npm start
```

### Start the frontend
```bash
cd frontend
npm run dev
```

## API Endpoints

### POST /get-voice
Analyzes the emotion of a message and returns the appropriate voice.

**Request:**
```json
{
  "input": "I'm feeling really sad today"
}
```

**Response:**
```json
{
  "personality": "sad",
  "voiceId": "21m00Tcm4TlvDq8ikWAM",
  "description": "Soft and melancholic voice for sadness"
}
```

### POST /get-reply
Generates a response adapted to the detected emotion.

**Request:**
```json
{
  "input": "I'm feeling really sad today",
  "emotion": "sad",
  "persona": "therapist"
}
```

### GET /voices
Returns all available voices.

## Architecture

```
frontend/          # React user interface
├── src/app/
│   └── session/   # Chat page with dynamic voices

backend/           # Node.js API
├── src/
│   ├── server.ts      # Express server
│   ├── voiceConfig.ts # Voice configuration
│   └── assistant.ts   # Vapi assistant
```

## Customization

### Adding a new voice
1. Modify `backend/src/voiceConfig.ts`
2. Add a new entry with the Vapi voice ID
3. Define associated emotions

### Modifying emotional classification
1. Modify the system prompt in `backend/src/server.ts`
2. Adjust emotion labels according to your needs

## Advanced Features

### Claude 4 Emotion Analysis
The system uses Claude 4 for sophisticated emotion detection:
- Analyzes overall context and tone, not just keywords
- Considers emotional intensity and urgency
- Evaluates implicit emotional cues
- Handles mixed emotions by selecting the dominant one
- Considers cultural and contextual factors

### Dynamic Voice Switching
- Real-time emotion detection
- Seamless voice transitions
- Context-aware voice selection
- Fallback to default voice for unrecognized emotions

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **AI**: Claude 4 (Anthropic)
- **Voice**: Vapi AI
- **Styling**: Tailwind CSS

## Testing Examples

Try these messages to test different emotions:

- "I'm feeling really sad" → Melancholic voice
- "I'm super excited!" → Energetic voice
- "I'm afraid of the future" → Soothing voice
- "I'm so angry right now" → Firm but calm voice
- "I need someone to understand me" → Empathetic voice 