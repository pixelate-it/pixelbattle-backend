const { insideToken } = require('../../settings.json');
const { reasons } = require('../extra/Constants');

const hexRegExp = /^#[0-9A-F]{6}$/i;

module.exports = ({ canvas }) => ({
    method: 'POST',
    path: '/pixels/clear',
    schema: {
        body: {
            type: 'object',
            required: ['token'],
            properties: {
                token: { type: 'string' },
                color: { type: 'string', maxLength: 7 }
            }
        }
    },
    config: {
        rateLimit: {
            max: 1,
            timeWindow: '5s'
        }
    },
    async handler(request, response) {
        if(request.body.token !== insideToken) return response
            .code(401)
            .send({ error: true, reason: reasons[0] });

        const color = request.body.color ?? '#FFFFFF';

        if(!hexRegExp.test(color)) return response
            .code(400)
            .send({ error: true, reason: reasons[5] });

        await canvas.clear();

        return response
            .code(200)
            .send({ error: true, reason: reasons[1], canvas: { width: canvas.width, height: canvas.height } });
    }
});