const {Router} = require('express');
const swaggerUi = require('swagger-ui-express');

const userRouter = require('./userRouter');
const swaggerDocument = require('../swagger.json');


const router = Router();

router.use('/object', userRouter);
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));

module.exports = router