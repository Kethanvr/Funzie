import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Static file server (for audio files)
app.use(express.static('public'));

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyDXFpZUN1p_XTPb5wd8zzFs4ajhlQvIevA");

// Chat Route (Text Input)
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format chat history
    const formattedHistory = history.map((entry) => ({
      role: entry.role === 'chatbot' ? 'model' : entry.role,
      parts: [{ text: entry.text }],
    }));
    formattedHistory.push({ role: 'user', parts: [{ text: message }] });

    // Send chat message
    const chat = model.startChat({ history: formattedHistory });
    let result = await chat.sendMessageStream(message);
    let chatResponse = '';

    for await (const chunk of result.stream) {
      chatResponse += chunk.text();
    }

    // Simulate speech output for the chat response
    const audioPath = 'public/output.mp3';
    fs.writeFileSync(audioPath, "Simulated audio content", 'utf8'); // Simulated audio content

    res.json({ reply: chatResponse, audioUrl: `http://localhost:${PORT}/output.mp3` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong with the API', details: error.message });
  }
});

// Audio Processing Route (Voice Input)
app.post('/api/audio', async (req, res) => {
  const { audioPath } = req.body;

  if (!audioPath) {
    return res.status(400).json({ error: 'Audio path is required' });
  }

  try {
    // Simulate audio transcription
    const transcript = 'This is a simulated transcription.';

    // Simulate chatbot response
    const reply = `You said: "${transcript}". This is a simulated reply.`;

    // Simulate speech output
    const audioOutputPath = 'public/chatbot_reply.mp3';
    fs.writeFileSync(audioOutputPath, "Simulated audio content", 'utf8'); // Simulated audio content

    res.json({ reply, audioUrl: `http://localhost:${PORT}/chatbot_reply.mp3` });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing audio input', details: error.message });
  }
});

// File/PDF Processing Route
app.post('/api/file', async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: 'File URL is required' });
  }

  try {
    // Simulate file processing
    const result = { response: { text: () => 'This is a simulated summary of the document.' } };

    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong with the API', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
