# Funzie

Funzie is a learning companion for children, with a welcome page and a chat experience built around stories, games, and interesting facts. The project combines a React interface with a small Express chat service.

## Project layout

- `funzie-app/` — the active Vite and React application.
- `funzie-app/server/chat.js` — Express endpoints used by the chat page.
- The repository-level `package.json` is a separate legacy Create React App setup; use the nested app for current development.

## Run the interface

```bash
cd funzie-app
npm install
npm run dev
```

Vite prints the local URL when it starts. The chat page sends requests to the API at `http://localhost:5000`.

## Run the chat service

In a second terminal:

```bash
cd funzie-app
node server/chat.js
```

The service listens on port `5000` by default and exposes `POST /api/chat` and `POST /api/audio`.

## Current prototype boundaries

The chat endpoint calls Gemini. The audio endpoint currently contains simulated transcription and response behavior; it is not a complete speech-to-text pipeline. The server source also contains a provider credential directly in code. Treat that credential as exposed, rotate it, and move configuration to server-side environment variables before running or deploying the service. Never put provider secrets in the Vite client or commit them to Git.

## Requirements

- Node.js and npm
- A rotated, server-side Gemini credential after the source configuration is corrected
