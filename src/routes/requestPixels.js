const bmp = require('@wokwi/bmp-ts').default;
const { translateHex } = require('../extra/Utils');
const { defaultGame } = require('../../settings.json');

module.exports = (database) => ({
    method: 'GET',
    path: '/pixels.bmp',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '2s'
        }
    },
    async handler(_, response) {
        const pixels = await database
            .collection('pixels')
            .find({}, { projection: { _id: 0, color: 1 } })
            .toArray();

        response
            .header('Content-Type', 'image/bmp')
            .code(200)
            .send(
                bmp.encode({
                    width: Number(process.env.width ?? defaultGame.width),
                    height: Number(process.env.height ?? defaultGame.height),
                    data: new Uint8Array(pixels.map(pix => translateHex(pix.color)).flat()),
                    bitPP: 32,
                }).data
            );
    }
});