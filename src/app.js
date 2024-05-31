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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const maxRetries = 5;
const retryDelay = 1000; // 1 second initial delay

const proofreadText = async (params, retries = 0) => {
  try {
    const chatCompletion = await openai.chat.completions.create(params);
    return chatCompletion.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.status === 429 && retries < maxRetries) {
      console.warn(`Rate limit exceeded. Retrying in ${retryDelay * (retries + 1)}ms...`);
      await delay(retryDelay * (retries + 1));
      return proofreadText(params, retries + 1);
    } else if (error.status === 429 && retries >= maxRetries) {
      throw new Error('Exceeded maximum retries due to rate limiting.');
    } else {
      throw error;
    }
  }
};

app.post('/proofread', async (req, res) => {
  try {
    const { text, guidelines } = req.body;

    if (!text || !guidelines) {
      return res.status(400).send({ error: 'Text and guidelines are required.' });
    }

    const params = {
      messages: [{ role: 'user', content: `Proofread the following text according to these guidelines: ${guidelines}\n\nText: ${text}` }],
      model: 'gpt-3.5-turbo',  // Ensure the model name is correct and you have access to it
    };

    const proofreadTextResult = await proofreadText(params);

    res.send({ proofreadText: proofreadTextResult });
  } catch (error) {
    if (error.status === 429) {
      console.error('Proofreading Error:', error);
      res.status(429).send({
        error: 'You have exceeded your current quota. Please check your plan and billing details. If you are on a free plan, consider upgrading to a paid plan.'
      });
    } else {
      console.error('Proofreading Error:', error);
      res.status(500).send({ error: 'An error occurred during proofreading.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
