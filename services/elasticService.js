'use strict'

const fs = require('fs');
const {Client} = require('@elastic/elasticsearch');

const pass = process.env.ELASTIC_PASSWORD;

const config = {
    node: 'https://localhost:9200',
    auth: {
        username: 'elastic',
        password: pass
    },
    tls: {
        ca: fs.readFileSync('./http_ca.crt'),
        rejectUnauthorized: false
    }
}

const client = new Client(config);

class ElasticService {
    async elasticCreateUser(addUser) {
            const newUser = await client.index({
                index: 'user',
                id: addUser.user.id,
                body: addUser
            })
            console.log('newUser', newUser);
            return newUser;
    }

    async elasticExistUserById(userId){
            const result = await client.exists({
                index: 'user',
                id: userId
            })
            return result;
    }
  async elasticSearchHealth(){
        await client.cluster.health();
  }
}

module.exports = new ElasticService();