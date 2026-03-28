const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

//app.use('/api/books', require('./routes/books'));
app.use('/api/authors', require('./routes/authors'));
//app.use('/api/series', require('./routes/series'));
//app.use('/api/universes', require('./routes/universes'));
//app.use('/api/reading-log', require('./routes/reading-log'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log('Bookshelf API is running on port', port);
});
