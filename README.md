# MoodMosaic - Système de Voix Dynamiques

MoodMosaic est une application thérapeutique qui utilise l'IA pour adapter dynamiquement la voix de l'assistant selon l'état émotionnel de l'utilisateur.

## Fonctionnalités

### 🎭 Voix Dynamiques
Le système analyse automatiquement les messages de l'utilisateur et change la voix de l'assistant selon l'émotion détectée :

- **Calm** : Voix apaisante pour les conversations générales
- **Energetic** : Voix motivante pour l'enthousiasme
- **Sad** : Voix douce et mélancolique pour la tristesse
- **Happy** : Voix joyeuse pour les émotions positives
- **Anxious** : Voix très apaisante pour l'anxiété
- **Angry** : Voix ferme mais calme pour la colère
- **Empathetic** : Voix très compréhensive
- **Professional** : Voix structurée pour les sujets sérieux
- **Warm** : Voix chaleureuse et réconfortante
- **Soothing** : Voix extrêmement apaisante

### 🤖 Analyse Émotionnelle
- Utilise Claude AI pour analyser le contexte émotionnel
- Détecte automatiquement l'émotion dominante
- Adapte le style de réponse selon l'émotion

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

### Variables d'environnement
Créez un fichier `.env` dans le dossier `backend` :
```env
ANTHROPIC_API_KEY=votre_clé_api_claude
```

### Voix Vapi
Les IDs de voix sont configurés dans `backend/src/voiceConfig.ts`. Vous pouvez les modifier selon vos besoins.

## Utilisation

### Démarrer le backend
```bash
cd backend
npm start
```

### Démarrer le frontend
```bash
cd frontend
npm run dev
```

## API Endpoints

### POST /get-voice
Analyse l'émotion d'un message et retourne la voix appropriée.

**Request:**
```json
{
  "input": "Je me sens vraiment triste aujourd'hui"
}
```

**Response:**
```json
{
  "personality": "sad",
  "voiceId": "21m00Tcm4TlvDq8ikWAM"
}
```

### POST /get-reply
Génère une réponse adaptée à l'émotion détectée.

**Request:**
```json
{
  "input": "Je me sens vraiment triste aujourd'hui",
  "emotion": "sad",
  "persona": "therapist"
}
```

### GET /voices
Retourne toutes les voix disponibles.

## Architecture

```
frontend/          # Interface utilisateur React
├── src/app/
│   └── session/   # Page de chat avec voix dynamiques

backend/           # API Node.js
├── src/
│   ├── server.ts      # Serveur Express
│   ├── voiceConfig.ts # Configuration des voix
│   └── assistant.ts   # Assistant Vapi
```

## Personnalisation

### Ajouter une nouvelle voix
1. Modifiez `backend/src/voiceConfig.ts`
2. Ajoutez une nouvelle entrée avec l'ID de voix Vapi
3. Définissez les émotions associées

### Modifier la classification émotionnelle
1. Modifiez le prompt système dans `backend/src/server.ts`
2. Ajustez les labels d'émotions selon vos besoins

## Technologies Utilisées

- **Frontend** : Next.js, React, TypeScript
- **Backend** : Node.js, Express, TypeScript
- **IA** : Claude AI (Anthropic)
- **Voix** : Vapi AI
- **Styling** : Tailwind CSS 