const redis = require('redis');
const ApiError = require("../exceptions/apiError");
const elasticService = require("./elasticService");
const delay = process.env.DELAY || 5; //You can set the delay here or in the env file
// const REDIS_PORT = 6379;
const client = redis.createClient();
let redisStart = 'not started';

class RedisService {
    async updateUser(userData) {
        if (await this.redisExist(userData.id) === 0) {
            const res = await elasticService.elasticExistUserById(userData.id);
            if (!res) {
                // We create additional fields (status, createdAt, updatedAt) to fulfill the update condition within the delay - status
                // and then monitor the data in Elastic Search - createdAt, updatedAt
                await this.redisCreateUserById(userData);
                await this.fnDelay(userData.id, delay * 60 * 1000);//Convert delay to milliseconds
                return {userData, status: 201} //status 201 for create
            } else {
                //If our service crashed or started from another instance, the data in elastic will be consistent
                throw ApiError.ElasticError(`You can\'t change data, time is up, can only be changed in the first ${delay} minutes,
this id is already used in Elastic Search`);
            }
        }
        else {
            const {message} = await this.redisUpdateUserById(userData);
            if (!message) {
                throw ApiError.RedisError(`You can\'t change data, time is up, can only be changed in the first ${delay} minutes`, 400);

            } else {
                //status 200 for update
                return {userData, status: 200}
            }
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
                const dataRedis = await this.redisGet(userId)
                const createUser = await elasticService.elasticCreateUser(dataRedis);
                if (!createUser) {
                    throw ApiError.ElasticError('Some problem with create user to Elastic Search')
                }
                await this.redisUpdateStatusUserById(userId);
            }
        }, delay)
    }

    async redisExist(id) {
        try {
            client.on('error', (err) => {
                throw ApiError.RedisError('Redis Client Error', 400, [err])
            })
            if (redisStart !== 'started') {
                await client.connect();
                redisStart = 'started';
            }
            const data = await client.exists(id);
            return data
        } catch (err) {
            throw ApiError.RedisError('Redis Client Error', 400, [err])
        }
    }
    async redisGet(id) {
        try {
            let data = await client.get(id);
            data = JSON.parse(data);
            return data
        } catch (err) {
            throw ApiError.RedisError('Redis Client Error', 400, [err])
        }
    }
    async redisCreateUserById(userData) {
        try {
            const saveUser = {status: true, createdAt: new Date().toLocaleString(), updatedAt: null, user: userData}
            await client.set(userData.id, JSON.stringify(saveUser));
            // await client.expire(userData.id,delay*2*60);
        } catch (err) {
            throw ApiError.RedisError('Redis Client Error', 400, [err])
        }
    }

    async redisUpdateUserById(userData) {
        try {
            let data = await client.get(userData.id);
            data = JSON.parse(data);
            const {status} = data
            if (!status) {
                return {message: false}

            } else {
                const saveUser = {...data, updatedAt: new Date().toLocaleString(), user: userData}
                await client.set(userData.id, JSON.stringify(saveUser));
                return {message: true};
            }

        } catch (err) {
            throw ApiError.RedisError('Redis Client Error', 400, [err])
        }
    }

    async redisUpdateStatusUserById(userId) {
        try {
            let data = await client.get(userId);
            data = JSON.parse(data);
            const {status} = data;
            if (status) {
                const saveUser = {...data, status: false}
                await client.set(userId, JSON.stringify(saveUser));
            }
            setTimeout(async ()=> await client.del(userId),5*60*1000);

        } catch (err) {
            throw ApiError.RedisError('Redis Client Error', 400, [err])
        }
    }


}

module.exports = new RedisService();