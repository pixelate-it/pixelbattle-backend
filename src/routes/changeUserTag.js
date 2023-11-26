const { reasons } = require('../extra/Constants');

module.exports = ({ database }) => ({
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
        const user = await database
            .collection('users')
            .findOne(
                { 
                    token: request.body.token,
                    userID: request.params.id
                },
                {
                    projection: {
                        _id: 1
                    }
                }
            );

        if(!user) return response
            .code(404)
            .send({ error: true, reason: reasons[7] });

        done();
    },
    async handler(request, response) {
        await database
            .collection('users')
            .updateOne(
                {
                    token: request.body.token,
                    userID: request.params.id
                },
                {
                    $set: {
                        tag: (!request.body.tag) ? null : request.body.tag.replace(/\s+/i, ' ').trim()
                    }
                }
            );

        return response
            .code(200)
            .send({ error: false, reason: reasons[1] });
    }
});