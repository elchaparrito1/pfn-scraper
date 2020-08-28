const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');
const pullData = require('./crawler');


const scrapeRoute = express.Router();

const app = express();
require('dotenv').config({ path: '.env' });

const port = process.env.PORT || 3001;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.json());

// ... other app.use middleware
app.use(express.static(path.join(__dirname, 'scraper', 'build')));

scrapeRoute.route('/scrape').get(async (req, res) => {
  try {
    const data = await pullData()
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json('Unable to scrape. Try again in 5 minutes.');
  }
});

app.use('/api', scrapeRoute);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'scraper', 'build', 'index.html'));
});

app.listen(port, function() {
  console.log(`Server is running on Port: ${port}`);
});
