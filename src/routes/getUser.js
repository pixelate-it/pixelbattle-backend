const { reasons } = require('../extra/Constants');

module.exports = ({ parameters, users }) => ({
    method: 'GET',
    path: '/users/:id',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '1s'
        }
    },
    async handler(request, response) {
        const user = await users.get({ userID: request.params.id });

        if(!user) return response
            .code(404)
            .send({ error: true, reason: reasons[7] });

        return response
            .send({
                ...Object.fromEntries(
                    Object
                        .entries(user)
                        .filter(n => n[1] !== user.token)
                ),
                banned: parameters.bans.includes(request.params.id),
                isMod: parameters.moderators.includes(request.params.id)
            });
    }
});