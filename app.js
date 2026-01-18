import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Twitch Analytics funcionando 🚀');
});

export default app;