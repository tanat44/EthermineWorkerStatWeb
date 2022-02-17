
// EXPRESS
var express = require('express');
var app = express();
app.use(express.json());

// MONGO
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://tanut:tanat444@etherminestat.j9rhw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(url, {
    useUnifiedTopology: true
})
const dbName = 'ethermine';
var db, config;
client.connect(async function (err) {
    if (err) throw err;
    db = client.db(dbName)
    app.listen(3000);
    console.log(`=============\nListening on 3000, Mongo connected\n=============` );

    config = await db.collection('config').findOne()
    server()
})

const id = `791D0b40490Eba6B00191f559aC7ed74bb3390D8`

var axios = require('axios');
const { Db } = require('mongodb');
function server(){
    console.log(test())

    async function test(){
        await addWallet(id)
        await updateWorkers(id)
        await fetchHistory(id)
    }

    async function addWallet(walletId){
        const data = {walletId: walletId}
        await db.collection('wallet').update(data, {$setOnInsert: data}, {upsert: true})
    }
    
    async function updateWorkers(walletId){
        let workers = await axios.get(`${config.baseUrl}/${walletId}/workers`)
        workers = workers.data.data
        workers.forEach( async w => {
            const found = await db.collection('wallet').findOne({
                walletId: walletId,
                workers: {
                    $elemMatch: {worker: w.worker}
                }
            })
            if (found)
                return;

            const filter = {walletId: walletId};
            const updateDoc = {
                $push: {workers: w},
            };
            await db.collection('wallet').updateOne(filter, updateDoc, { upsert: true })
        })
        
    }
    
    async function fetchHistory(walletId) {
        let workers = await db.collection('wallet').aggregate([
            {
                $match: {walletId : walletId}
            },
            {
                $unwind: "$workers"
            },
            {
                $project: {"workers.worker": 1}
            },
            {
                $replaceRoot: { newRoot: "$workers"}
            }
        ]).toArray()
        workers = workers.map (w => w.worker)
        console.log(workers)
        // let tasks = workers.map(w => axios.get(`${config.baseUrl}/${walletId}/worker/${w.worker}/history`))
        // Promise.all(tasks).then( async res => {           
        //     res.forEach((element, index)=>{
        //         const history = element.data.data
        //         await db.collection('wallet').updateOne()
        //     })
        // })
    }
    
    
    // APIs
    app.post('/wallet', async function (req, res) {
        db.collection('wallet').insertOne()
        res.json({ok: true})
    });
}

// Scheduling job
// var schedule = require('node-schedule');
// var dailyJob = schedule.scheduleJob('*/5 * * * * *', function(){
//   console.log('Run your process here');
// });

//


// app.get('/employee/:firstname', async function (req, res) {
//     try {
//         const firstname = req.params.firstname;
//         const result = await db.collection('employee').find({firstname: firstname}).toArray();
//         res.send(result);
//     } catch (err) {
//         res.send({ok: false});
//     }
// })

// app.post('/employee', async function(req, res) {
//     const body = req.body;
//     body.createDate = new Date();
//     try {
//         await db.collection('employee').insertOne(body);
//     } catch (err) {
//         console.log(err);
//         res.send({ok: false});
//     }
//     res.send({ok: true});
// })

// app.patch('/employee/:id', async function (req, res) {
//     const body = req.body;
//     const id = req.params.id;
//     try {
//         await db.collection('employee').updateOne({_id: ObjectID(id)}, {$set: body})
//     } catch (err) {
//         console.log(err);
//         res.send({ok: false});
//     }
//     res.send({ok: true});
// })


// app.delete('/employee/:id', async function(req, res) {
//     const id = req.params.id;
//     try {
//         await db.collection('employee').deleteOne({_id: ObjectID(id)})
//     } catch (err) {
//         console.log(err);
//         res.send({ok: false});
//     }
//     res.send({ok: true});
// })