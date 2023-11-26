const { insideToken, syncEvery } = require('../../settings.json');
const { reasons } = require('../extra/Constants');

module.exports = ({ database, game, canvas }) => ({
    method: 'POST',
    path: '/game/change',
    schema: {
        body: {
            type: 'object',
            required: ['token', 'ended'],
            properties: {
                token: { type: 'string' },
                ended: { type: 'boolean' }
            }
        }
    },
    config: {
        rateLimit: {
            max: 1,
            timeWindow: '3s'
        }
    },
    async handler(request, response) {
        if(request.body.token !== insideToken) return response
            .code(401)
            .send({ error: true, reason: reasons[0] });

        if(request.body.ended === game.ended) return response
            .code(200)
            .send({ error: false, reason: reasons[1] });

        game.ended = request.body.ended;
        switch(request.body.ended) {
            case true: {
                clearInterval(global.sync);
                request.server.websocketServer.clients.forEach((client) =>
                    client.readyState === 1 &&
                        client.send(JSON.stringify({
                            op: 'ENDED',
                            value: true
                        })
                    )
                );
                
                await canvas.sendPixels();
                break;
            }

            case false: {
                global.sync = setInterval(async() => { 
                    await canvas.sendPixels()
                        .then(() => console.log('* [ROOT] Canvas synchronized with database'));
                }, syncEvery);

                request.server.websocketServer.clients.forEach((client) =>
                    client.readyState === 1 &&
                        client.send(JSON.stringify({
                            op: 'ENDED',
                            value: false
                        })
                    )
                );
                break;
            }
        }

        await database
            .collection('games')
            .updateOne({ id: 0 }, { $set: { ended: request.body.ended } });

        return response           
            .code(202)
            .send({ error: false, reason: 'Accepted' });
    }
});