const redis = require('redis');
const getDB = require('./mongo')


/*
    If localhost, 127.0.0.1, or redis://localhost does not work 

    Run command: docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' vero-suite_redis_1

    to get the ip address of redis

*/
const REDIS_HOST = '<host>'
const REDIS_PORT = '<port>'
const CHANNEL_NAME = 'channel-name'

// Messages that need to be emitted are the number of cameras in the collection truncated to the hundredth.
// Example: 1,838 cameras -----> 1,800 messages to be emitted.
// Example two: 861 --------> 800 messages to be emitted.
const MESSAGES_TO_EMIT = 400;


function minutesToMilliseconds(mins) {
    const seconds = mins * 60;
    const milliseconds = seconds * 1000

    return milliseconds;
}



function sleepTimePerCamera(mins, cameraListLength) {
    const time = minutesToMilliseconds(mins);

    return Math.floor(time / cameraListLength)
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCameras () {
    const db = await getDB()
    
    const cameras = await db.collection('cameras').find({}).toArray()

    return cameras;
}


async function spamRedisChannel () {
    const client = await connectRedis()

    
    const cameras = await getCameras()


    for (let i = 0; i <= MESSAGES_TO_EMIT; i++) {

        if (cameras[i]) {
            console.log('Processing Camera: ', i + 1)
            const record = {
                cameraId: cameras[i]._id,
                status: cameras[i].title,
            }
            client.publish(CHANNEL_NAME, JSON.stringify(record))
            await sleep(sleepTimePerCamera(10, MESSAGES_TO_EMIT))
        }

    }

    console.log('Done sending messages!')
    
}

async function connectRedis () {
    let client = redis.createClient(REDIS_PORT, REDIS_HOST, {
        return_buffers: true
    })

    return client

}



spamRedisChannel().then(console.log)