module.exports = ({ game }) => ({
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
        connection.write(JSON.stringify({ op: 'ENDED', value: game.ended }));
    }
});