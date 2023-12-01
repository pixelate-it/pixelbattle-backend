const bmp = require('@wokwi/bmp-ts').default;
const { translateHex } = require('../extra/Utils');
const { defaultGame } = require('../../settings.json');

module.exports = ({ canvas, game }) => ({
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
        return response
            .header('Content-Type', 'image/bmp')
            .code(200)
            .send(
                bmp.encode({
                    width: game.width,
                    height: game.height,
                    data: new Uint8Array(canvas.pixels.map(pix => translateHex(pix.color)).flat()),
                    bitPP: 32,
                }).data
            );
    }
});