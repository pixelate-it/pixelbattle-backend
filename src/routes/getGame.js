const { defaultGame } = require('../../settings.json');

module.exports = ({ game }) => ({
    method: 'GET',
    path: '/game',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const online = new Set();
        request.server.websocketServer.clients.forEach(v => online.add(v.request_ip));

        const schema = { 
            name: process.env.name ?? defaultGame.name,
            cooldown: game.cooldown,
            ended: game.ended,
            canvas: {
                height: Number(process.env.height ?? defaultGame.height),
                width: Number(process.env.width ?? defaultGame.width)
            },
            online: online.size
        };

        return response
            .code(200)
            .send(schema);
    }
});