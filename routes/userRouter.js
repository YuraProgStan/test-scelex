const {Router} = require('express');

const userController = require('../controllers/userController');
const validateMiddleware = require('../middlewares/validateMiddleware');
const router = Router();

router.put('/', validateMiddleware.userValid, userController.updateUser)

module.exports = router