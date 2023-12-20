const { reasons } = require('../extra/Constants');
const { sendPixelPlaced } = require('../helpers/LoggingHelper');
const hexRegExp = /^#[0-9A-F]{6}$/i;

const cache = new Map();

module.exports = ({ parameters, canvas, users, game }) => ({
    method: 'PUT',
    path: '/pixels',
    schema: {
        body: {
            type: 'object',
            required: ['color', 'x', 'y'],
            properties: {
                color: { type: 'string' },
                token: { type: 'string' },
                x: { type: 'integer' },
                y: { type: 'integer' }
            }
        }
    },
    config: {
        rateLimit: {
            max: 5,
            timeWindow:'1s'
        }
    },
    async preHandler(request, response, done) {
        const user = await users.get({ token: request.body.token });

        if(!user) return response
            .code(401)
            .send({ error: true, reason: reasons[7] });

        if(game.ended) return response
            .code(400)
            .send({ error: true, reason: reasons[2] });
        if(parameters.bans.includes(user.userID)) return response
            .code(400)
            .send({ error: true, reason: reasons[3] });
        if(user.cooldown > Date.now()) return response
            .send(
                {
                    error: true,
                    reason: reasons[4], 
                    cooldown: Number(((user.cooldown - Date.now()) / 1000).toFixed(1))
                }
            );

        request.userSession = user;
        done();
    },
    async handler(request, response) {
        const x = Number(request.body.x);
        const y = Number(request.body.y)
        const color = request.body.color;

        if(!hexRegExp.test(color)) return response
            .code(400)
            .send({ error: true, reason: reasons[5] });

        const pixel = canvas.select({ x, y });
        if(!pixel) return response
            .code(400)
            .send({ error: true, reason: reasons[6] });

        let cooldown;
        let adminCheck = parameters.moderators.includes(request.userSession.userID);
        switch(adminCheck) {
            case true:
                cooldown = Date.now() + 50;
                break;

            case false:
                cooldown = Date.now() + game.cooldown;
                break;
        }

        await users.edit({ token: request.body.token }, { cooldown });

        if(!cache.has(`${request.userSession.userID}-${x}-${y}-${color}`)) {
            canvas.paint(
                { x, y },
                {
                    color,
                    author: request.userSession.username,
                    tag: adminCheck
                        ? null
                        : request.userSession.tag
                }
            );

            request.server.websocketServer.clients.forEach((client) =>
            client.readyState === 1 &&
                client.send(JSON.stringify({
                        op: 'PLACE',
                        x, y,
                        color
                    })
                )
            );

            sendPixelPlaced(
                {
                    tag: adminCheck
                        ? 'Pixelate It! Team'
                        : request.userSession.tag,
                    userID: request.userSession.userID,
                    x, y,
                    color
                }
            );
            cache.set(`${request.userSession.userID}-${x}-${y}-${color}`);
            setTimeout(() => cache.delete(`${request.userSession.userID}-${x}-${y}-${color}`), 600); // CORS spam fix
        }

        return response
            .code(200)
            .send({ error: false, reason: reasons[1] });
    }
});