const fs = require('fs');

module.exports = (_) => ({
    method: 'GET',
    path: '/favicon.ico',
    schema: {},
    config: {
        rateLimit: {
            max: 1,
            timeWindow: '3s'
        }
    },
    async handler(request, response) {
        return response
            .header('Content-Type', 'image/x-icon')
            .code(200)
            .send(await fs.readFileSync('./api/assets/favicon.ico'));
    }
});