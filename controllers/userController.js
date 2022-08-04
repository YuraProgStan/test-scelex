const redisService = require('../services/redisService');
const elasticService = require('../services/elasticService');
const ApiError = require('../exceptions/apiError');

class UserController {
    async updateUser(req, res, next) {
        const user = req.body;
        try {
            //Checking the connection to elastic
            await elasticService.elasticSearchHealth();
            //We use our redisService for save/update data in application storage (data.js)  and saving data after delay in elastic
            try {
                const {userData, status} = await redisService.updateUser(user)
                res.status(status).json(user);
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