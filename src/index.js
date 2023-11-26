[
    '  _____    _                 _           _              _____   _     _ ',
    ' |  __ \\  (_)               | |         | |            |_   _| | |   | |',
    ' | |__) |  _  __  __   ___  | |   __ _  | |_    ___      | |   | |_  | |',
    ' |  ___/  | | \\ \\/ /  / _ \\ | |  / _` | | __|  / _ \\     | |   | __| | |',
    ' | |      | |  >  <  |  __/ | | | (_| | | |_  |  __/    _| |_  | |_  |_|',
    ' |_|      |_| /_/\\_\\  \\___| |_|  \\__,_|  \\__|  \\___|   |_____|  \\__| (_)',
    '                                                                        ',
    ' by mirdukkkkk & Pixelate It Team                                       ',
    '                                                                        '
].map(str => console.log(str));

const settings = require('../settings.json');
const path = require('path');
const fs = require('fs');
const fastify = require('fastify');
const { MongoClient } = require('mongodb');
const { reasons } = require('./extra/Constants');
const CanvasManager = require('./helpers/CanvasManager');

const parameters = {};

(async() => {
    const mongo = new MongoClient(
        settings.database
    );
    const database = mongo.db('pixelbattledev');
    await mongo.connect();

    const canvas = new CanvasManager(database.collection('pixels'));
    console.log('* [ROOT] Initializing the canvas');
    await canvas.init();

    parameters.moderators = 
        await database
        .collection('moderators')
        .find({}, { projection: { _id: 0, userID: 1 } })
        .toArray()
        .then(
            arr =>
            arr.map(_ =>
                _.userID
            )
        );
    parameters.bans = 
        await database
        .collection('bans')
        .find({}, { projection: { _id: 0, userID: 1 } })
        .toArray()
        .then(
            arr =>
            arr.map(_ =>
                _.userID
            )
        );

    const game = 
        await database
        .collection('games')
        .findOne({ id: 0 }, { projection: { _id: 0 } });

    const app = fastify();

    await app
        .register(require('@fastify/cors'), { origin: true })
        .register(require('@fastify/formbody'))
        .register(require('@fastify/rate-limit'), {
            keyGenerator: (request) => request.headers['cf-connecting-ip'] || request.ip,
            hook: 'preParsing',
            global: true
        })
        .register(require('@fastify/under-pressure'), {
            maxHeapUsedBytes: 536870912,
            sampleInterval: 1000
        })
        .register(require('@fastify/websocket'), {
            options: {
                clientTracking: true
            }
        });

    app.setErrorHandler(function(error, request, response) {
        if(error.statusCode == 429) response.code(429).send({ error: true, reason: reasons[8] })
    });

    for(
        const file 
        of fs.readdirSync(path.join(__dirname, 'routes'))
        .filter(file => file.endsWith('.js'))
    ) {
        const route = require(`./routes/${file}`)({ database, parameters, canvas, game });
        console.log(`* [${route.method}] ${route.path} - loaded`);
        app.route(route);
    }

    app.listen({ host: '0.0.0.0', port: process.env.PORT ?? 8080 }, (err, address) => {
        if(err) {
            app.log.error(err);
            process.exit(1);
        }

        console.log(`* [ROOT] Server is now listening on ${address}`);
    });

    if(!game.ended) global.sync = setInterval(async() => { 
        await canvas.sendPixels()
            .then(() => console.log('* [ROOT] Canvas synchronized with database'));
    }, settings.syncEvery);
})();