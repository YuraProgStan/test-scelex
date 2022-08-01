const data = require('../data');
const ApiError = require('../exceptions/apiError');
const delay = process.env.DELAY || 5; //You can set the delay here or in the env file
const elasticService = require('./elasticService');

class UserService {
    // Function to create (save new object) and update an object
    async updateUser(userData) {
        if (!data.length || !data.some(item => item.user.id === userData.id)) {
            const res = await elasticService.elasticExistUserById(userData.id);
            if (!res) {
                // We create additional fields (status, createdAt, updatedAt) to fulfill the update condition within the delay - status
                // and then monitor the data in Elastic Search - createdAt, updatedAt
                data.push({user: userData, status: true, createdAt: new Date().toLocaleString(), updatedAt: null});
                await this.fnDelay(userData.id, delay * 60 * 1000);//Convert delay to milliseconds
                return {userData, status: 201} //status 201 for create
            } else {
                //If our service crashed or started from another instance, the data in elastic will be consistent
                throw ApiError.ElasticError(`You can\'t change data, time is up, can only be changed in the first ${delay} minutes,
this id is already used in Elastic Search`);
            }
        } else {
            const findUserIndex = data.findIndex(item => item.user.id === userData.id && item.status);
            if (findUserIndex === -1) {
                //Status in data with current id has been changed to value false, we can't changed object
                throw ApiError.BadRequest(`You can\'t change data, time is up, can only be changed in the first ${delay} minutes`);
            }
            data[findUserIndex].user = userData;
            data[findUserIndex].updatedAt = new Date().toLocaleString();
            return {userData, status: 200} //status 200 for update
        }
    }

    // Function to save data in elastic according to delay
    async fnDelay(userId, delay) {
        return setTimeout(async () => {
            if (await elasticService.elasticExistUserById(userId)) {
                // If we used multiple instances of the application, the data in elastic could change at the current moment
                throw ApiError.ElasticError(`You can\'t change data, time is up, can only be changed in the first ${delay} minutes,
this id is already used in Elastic Search`)
            } else {
                const createUser = await elasticService.elasticCreateUser(data.find(item => item.user.id === userId));
                if (!createUser) {
                    throw ApiError.ElasticError('Some problem with create user to Elastic Search')
                }
                const findUserIndex = data.findIndex(item => item.user.id === userId);
                data[findUserIndex].status = false;
            }
        }, delay)
    }
}

module.exports = new UserService;