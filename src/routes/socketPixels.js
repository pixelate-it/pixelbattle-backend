const { defaultGame } = require('../../settings.json');

module.exports = () => ({
    method: 'GET',
    path: '/pixels/socket',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    handler() { return 'why did you check this?'; },
    wsHandler(connection, request) {
        connection.setEncoding('utf8');
        connection.socket.request_ip = (request.headers['cf-connecting-ip'] || request.ip);
        if(JSON.parse(process.env.ended ?? defaultGame.ended)) connection.write(JSON.stringify({ op: 'ENDED', value: true }));
    }
});