//const bmp = require('@wokwi/bmp-ts').default;
const png = require('fast-png');
const { translateHex } = require('../extra/Utils');

module.exports = ({ canvas, game }) => ({
    method: 'GET',
    path: '/pixels.png',
    schema: {},
    config: {
        rateLimit: {
            max: 3,
            timeWindow: '2s'
        }
    },
    async handler(_, response) {
        return response
            .header('Content-Type', 'image/png')
            .code(200)
            .send(
                png.encode({
                    width: game.width,
                    height: game.height,
                    channels: 3,
                    data: new Uint8Array(canvas.pixels.map(pix => translateHex(pix.color)).flat())
                })
                //bmp.encode({
                //    width: game.width,
                //    height: game.height,
                //    data: new Uint8Array(canvas.pixels.map(pix => translateHex(pix.color)).flat()), // change in utils to [255, b, g, r];
                //    bitPP: 24,
                //}).data
            );
    }
});