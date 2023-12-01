module.exports = ({ parameters }) => ({
    method: 'GET',
    path: '/bans',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '3s'
        }
    },
    async handler(request, response) {
        return response
            .code(200)
            .send({ bans: parameters.bans });
    }
});