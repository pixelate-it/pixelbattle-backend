const { isBoolean } = require('util');
const { insideToken, syncEvery } = require('../../settings.json');
const { reasons } = require('../extra/Constants');

module.exports = ({ database, game, canvas }) => ({
    method: 'POST',
    path: '/game/change',
    schema: {
        body: {
            type: 'object',
            required: ['token'],
            properties: {
                token: { type: 'string' },
                ended: { type: 'boolean' },
                cooldown: { type: 'integer' }
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

        console.log(request.body.ended +" # "+ game.ended);
        if(isBoolean(request.body.ended) && (request.body.ended !== game.ended)) {
            game.ended = request.body.ended;
            switch(request.body.ended) {
                case true: {
                    clearInterval(global.sync);
                    console.log('1');
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
                    global.sync = setInterval(async () => {
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
        }

        if(Number.isInteger(request.body.cooldown) && (request.body.cooldown !== game.cooldown)) {
            if(request.body.cooldown === 0) return response
                .code(400)
                .send({ error: false, reason: 'Cooldown cannot be zero' });

            game.cooldown = request.body.cooldown;
        }

        await database
            .collection('games')
            .updateOne({ id: 0 }, { $set: { ended: game.ended, cooldown: game.cooldown } });

        return response           
            .code(202)
            .send({ error: false, reason: 'Accepted' });
    }
});