const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

let surveys = [];

app.get('/', (req, res) => {
  res.send('Solar Survey Backend Running 🚀');
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API Working Successfully 🚀',
  });
});

/* GET ALL SURVEYS */
app.get('/api/surveys', (req, res) => {
  res.json(surveys);
});

/* CREATE SURVEY */
app.post('/api/surveys', (req, res) => {
  const survey = {
    id: Date.now(),
    createdAt: new Date().toLocaleString(),
    ...req.body,
  };

  surveys.unshift(survey);

  res.json({
    success: true,
    survey,
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});