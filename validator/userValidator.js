const Joi = require('joi');

const userValidator = {
    createUser: Joi.object({
        id: Joi.string().required(),
        //for any object
        object: Joi.object().required()

        //OR

        //for swagger object

        // object: Joi.object({
        //     name: Joi.string().regex(/^[[a-zA-ZА-яёЁіІїЇ]{2,20}$/),
        //     surname: Joi.string().required(),
        //     candidate: Joi.string().required()
        // })
    }),

}
module.exports = userValidator;