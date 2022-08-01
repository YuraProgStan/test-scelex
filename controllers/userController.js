const userService = require('../services/userService');
const elasticService = require('../services/elasticService');
const ApiError = require('../exceptions/apiError');

class UserController {
    async updateUser(req, res, next) {
        const user = req.body;
        try {
            //Checking the connection to elastic
            await elasticService.elasticSearchHealth();
            //We use our userService for save/update data in application storage (data.js)  and saving data after delay in elastic
            try {
                const {userData, status} = await userService.updateUser(user)
                res.status(status).json(userData);
            } catch (err) {
                next(err);
            }

        } catch (err) {
            // Catching a connection error to elastic
            next(ApiError.ElasticError('Some problem with connection elastic', 400, [{elasticError: err}]))
        }
    }
}

module.exports = new UserController()