require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

console.log(`Started server at ${PORT}...`);
app.listen(PORT);
