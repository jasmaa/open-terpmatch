require('dotenv').config();

const { app, logger } = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Started server on ${PORT}...`)
});