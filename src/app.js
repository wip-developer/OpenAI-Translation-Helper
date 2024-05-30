const OpenAI = require('openai');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables from .env file

const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the GPT Translation Helper!');
});

app.post('/proofread', async (req, res) => {
  try {
    const { text, guidelines } = req.body;

    if (!text || !guidelines) {
      return res.status(400).send({ error: 'Text and guidelines are required.' });
    }

    // Create parameters for chat completion
    const params = {
      messages: [{ role: 'user', content: `Proofread the following text according to these guidelines: ${guidelines}\n\nText: ${text}` }],
      model: 'gpt-3.5-turbo',
    };

    // Get chat completion
    const chatCompletion = await openai.chat.completions.create(params);

    // Extract proofread text from the completion
    const proofreadText = chatCompletion.data.choices[0].message.content.trim();

    res.send({ proofreadText });
  } catch (error) {
    console.error('Proofreading Error:', error);
    res.status(500).send({ error: 'An error occurred during proofreading.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
