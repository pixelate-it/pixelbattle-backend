const { insideToken } = require('../../settings.json');
const { reasons } = require('../extra/Constants');

module.exports = (_, parameters) => ({
    method: 'POST',
    path: '/bans/:id/edit',
    schema: {
        body: {
            type: 'object',
            required: ['token', 'action'],
            properties: {
                token: { type: 'string' },
                action: { type: 'boolean' }
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
        if(request.body.action) parameters.bans.push(request.params.id);
        else parameters.bans = parameters.bans.filter(_ => _ !== request.params.id);

        return response
            .code(202)
            .send({ error: false, reason: "Accepted" });
    }
});