const express = require('express');
require('dotenv').config();
const cors = require('cors');

const apiRouter = require('./routes/apiRouter');
const errorMiddleware = require('./middlewares/errorMiddleware');
const ApiError = require('./exceptions/apiError');

const PORT = process.env.PORT || 5500;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.use((req, res, next) => {
    next(ApiError.BadRequest('Not found url', 404))
});
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server has been started on PORT ${PORT}`)
})