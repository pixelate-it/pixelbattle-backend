const { reasons } = require('../extra/Constants');

module.exports = ({ canvas }) => ({
    method: 'GET',
    path: '/pixels',
    schema: {
        querystring: {
            x: { type: 'integer' },
            y: { type: 'integer' }
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const data = canvas.select({ x: request.query.x, y: request.query.y })

        if(!data) return response
            .code(404)
            .send({ error: true, reason: reasons[7] });

        return response
            .code(200)
            .send(data);
    }
});