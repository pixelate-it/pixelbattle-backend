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
                name: { type: 'string', maxLength: 32 },
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

        if((typeof request.body.ended === 'boolean') && (request.body.ended !== game.ended)) {
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
                    await canvas.init(game.width, game.height);
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

        if((typeof request.body.name === 'string') && (request.body.name !== game.name)) {
            game.name = request.body.name;
        }

        await database
            .collection('games')
            .updateOne({ id: 0 }, { $set: { ended: game.ended, cooldown: game.cooldown, name: game.name } });

        return response           
            .code(202)
            .send({ error: false, reason: 'Accepted' });
    }
});