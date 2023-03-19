//importing mongo db module and mongoclient obj
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectId;

let database;

//1.CREATING DATABASE --> creating asynchronous function since there may be a chance of delay
async function getdatabase()
{
    //assigning mongodb connection string to client variable  -->computer runs the mongodb in certain ports : 27017
    const client = await MongoClient.connect('mongodb://127.0.0.1:27017')
    database = client.db('shoppingmarket');  // library is db name, works like the mongdb command(use library)
    if(!database)
    {
        console.log('database not connected');
    }
    return database;
}

module.exports = {getdatabase,ObjectID};