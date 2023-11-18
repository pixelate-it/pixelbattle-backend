module.exports = (_, parameters) => ({
    method: 'GET',
    path: '/moderators',
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
            .send({ moderators: parameters.moderators });
    }
});