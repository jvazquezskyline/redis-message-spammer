const {MongoClient} = require('mongodb')


const MONGO_URL = 'mongodb://localhost:27017'

async function getDB () {
    const client = new MongoClient(MONGO_URL)
    await client.connect()

    const db = client.db('vero')

    return db
    
}


module.exports = getDB
