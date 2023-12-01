const { reasons } = require('../extra/Constants');

module.exports = ({ database, parameters }) => ({
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
        const user = await database.collection('users').findOne(
            { 
                userID: request.params.id 
            }, 
            { 
                projection: {
                    _id: 0,
                    userID: 1,
                    cooldown: 1,
                    tag: 1,
                    username: 1
                } 
            }
        );

        if(!user) return response
            .code(404)
            .send({ error: true, reason: reasons[7] });

        return response
            .send({ ...user, banned: parameters.bans.includes(request.params.id), isMod: parameters.moderators.includes(request.params.id) });
    }
});