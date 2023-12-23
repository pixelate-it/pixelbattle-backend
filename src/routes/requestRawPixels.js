module.exports = ({ canvas, game }) => ({
    method: 'GET',
    path: '/pixels.json',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '10s'
        }
    },
    async handler(_, response) {
        return response
            .header('Content-Type', 'application/json')
            .code(200)
            .send({ 
		pixels: canvas.pixels,
		width: game.width,
		height: game.height
	 });
    }
});