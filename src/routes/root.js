module.exports = () => ({
    method: 'GET',
    path: '/',
    schema: {},
    handler(request, response) {
        return response
            .code(200)
            .send({ error: false, reason: 'PixelAPI v3 works! Good time for chill :D' });
    }
});