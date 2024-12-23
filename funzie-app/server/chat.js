import express from 'express';
import cors from 'cors';
// import { GoogleGenerativeAI, GoogleAIFileManager } from '@google/generative-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Initialize Google Generative AI and File Manager
const genAI = new GoogleGenerativeAI("AIzaSyDXFpZUN1p_XTPb5wd8zzFs4ajhlQvIevA");
// const fileManager = new GoogleAIFileManager("AIzaSyDXFpZUN1p_XTPb5wd8zzFs4ajhlQvIevA");

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

    res.json({ reply: chatResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong with the API', details: error.message });
  }
});

// Image Processing Route
app.post('/api/image', async (req, res) => {
  const { imagePaths } = req.body;

  if (!imagePaths || !Array.isArray(imagePaths)) {
    return res.status(400).json({ error: 'Image paths are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });

    const imageBuffers = await Promise.all(
      imagePaths.map((path) => fetch(path).then((response) => response.arrayBuffer()))
    );

    const result = await model.generateContent([
      ...imageBuffers.map((buffer) => ({
        inlineData: {
          data: Buffer.from(buffer).toString('base64'),
          mimeType: 'image/jpeg',
        },
      })),
      'Generate a list of all the objects contained in these images.',
    ]);

    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong with the API', details: error.message });
  }
});

// Audio Processing Route
app.post('/api/audio', async (req, res) => {
  const { audioPath } = req.body;

  if (!audioPath) {
    return res.status(400).json({ error: 'Audio path is required' });
  }

  try {
    const uploadResult = await fileManager.uploadFile(audioPath, {
      mimeType: 'audio/mp3',
      displayName: 'Audio Sample',
    });

    let file = await fileManager.getFile(uploadResult.file.name);
    while (file.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(uploadResult.file.name);
    }

    if (file.state === FileState.FAILED) {
      throw new Error('Audio processing failed.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      'Tell me about this audio clip.',
      {
        fileData: {
          fileUri: file.uri,
          mimeType: file.mimeType,
        },
      },
    ]);

    res.json({ reply: result.response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong with the API', details: error.message });
  }
});

// File/PDF Processing Route
app.post('/api/file', async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ error: 'File URL is required' });
  }

  try {
    const pdfBuffer = await fetch(fileUrl).then((response) => response.arrayBuffer());
    const pdfPath = 'temp.pdf';
    fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer), 'binary');

    const uploadResult = await fileManager.uploadFile(pdfPath, {
      mimeType: 'application/pdf',
      displayName: 'PDF Document',
    });

    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
    const result = await model.generateContent([
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
      'Summarize this document.',
    ]);

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
