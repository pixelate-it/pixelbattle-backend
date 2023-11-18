const { defaultGame } = require('../../settings.json');

module.exports = (database) => ({
    method: 'GET',
    path: '/info',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const total = await database
            .collection('users')
            .countDocuments();

        const online = new Set();
        request.server.websocketServer.clients.forEach(v => online.add(v.request_ip));

        const schema = { 
            name: process.env.name ?? defaultGame.name,
            cooldown: Number(process.env.cooldown ?? defaultGame.cooldown),
            ended: JSON.parse(process.env.ended ?? defaultGame.ended),
            canvas: {
                height: Number(process.env.height ?? defaultGame.height),
                width: Number(process.env.width ?? defaultGame.width)
            },
            players: { 
                total, 
                online: online.size 
            } 
        };

        return response
            .code(200)
            .send(schema);
    }
});