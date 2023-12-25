const { reasons } = require('../extra/Constants');

module.exports = ({ users }) => ({
    method: 'POST',
    path: '/users/:id/tag',
    schema: {
        body: {
            type: 'object',
            required: ['token', 'tag'],
            properties: {
                token: { type: 'string' },
                tag: { type: 'string', maxLength: 8 }
            }
        }
    },
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async preHandler(request, response, done) {
        const user = await users.get({
            token: request.body.token,
            userID: request.params.id
        })

        if(!user) return response
            .code(404)
            .send({ error: true, reason: reasons[7] });

        done();
    },
    async handler(request, response) {
        await users.edit(
            {
                token: request.body.token,
                userID: request.params.id
            },
            { tag: (!request.body.tag) ? null : request.body.tag.replace(/\s+/i, ' ').trim()  },
            true
        );

        return response
            .code(200)
            .send({ error: false, reason: reasons[1] });
    }
});