const { readFileSync }= require('fs');

module.exports = () => ({
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
            .send(await readFileSync('./api/assets/favicon.ico'));
    }
});