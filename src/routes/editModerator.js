const { insideToken } = require('../../settings.json');
const { reasons } = require('../extra/Constants');

module.exports = ({ parameters }) => ({
    method: 'POST',
    path: '/moderators/:id/edit',
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
        if(request.body.action) parameters.moderators.push(request.params.id);
        else parameters.moderators = parameters.moderators.filter(_ => _ !== request.params.id);

        return response
            .code(202)
            .send({ error: false, reason: "Accepted" });
    }
});