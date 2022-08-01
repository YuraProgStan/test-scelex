const userValidator = require('../validator/userValidator');
const ApiError = require('../exceptions/apiError') ;

class ValidateMiddleware {
    userValid(req, res, next) {
        try {
            const {error, value} = userValidator.createUser.validate(req.body);
            if (error) {
                next(ApiError.BadRequest(error.details[0].message));
            }
            req.body = value;
            next();
        } catch (err) {
            next(err);
        }
    }
}
module.exports = new ValidateMiddleware()