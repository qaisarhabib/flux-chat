# Simple Mistral Chatbot

A small full-stack chatbot built with React, TypeScript, NestJS, LangChain, and the Mistral API.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example and add your Mistral API key:

   ```bash
   cp .env.example .env
   ```

3. Start the frontend and backend:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173`.

The NestJS API runs on `http://localhost:3000`. Conversation history is kept in memory and resets when the backend restarts.

## API

`POST /api/chat`

```json
{
  "message": "Hello!",
  "conversationId": "optional-client-generated-id"
}
```

Response:

```json
{
  "reply": "Hello! How can I help?",
  "conversationId": "client-generated-id"
}
```
