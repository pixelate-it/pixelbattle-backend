const { reasons } = require('../extra/Constants');

module.exports = (database) => ({
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
        const x = request.query.x;
        const y = request.query.y;

        const data = await database
            .collection('pixels')
            .findOne(
                { x, y }, 
                { 
                    projection: {
                        _id: 0,
                        author: 1,
                        tag: 1
                    } 
                }
            );

        if(!data) return response
            .code(404)
            .send({ error: true, reason: reasons[7] });

        return response
            .code(200)
            .send(data);
    }
});