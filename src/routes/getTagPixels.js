module.exports = ({ canvas }) => ({
    method: 'GET',
    path: '/pixels/tag',
    schema: {},
    config: {
        rateLimit: {
            max: 2,
            timeWindow: '5s'
        }
    },
    async handler(request, response) {
        let pixels = canvas.pixels;

        let used = pixels.filter(x => x.tag !== null);
        let unused = pixels.filter(x => x.tag == null);

        let tags = {};
        for (let x of used) {
            if(!tags[x.tag]) tags[x.tag] = 0;
            tags[x.tag]++;
        }

        return response.send({
            pixels: {
                all: used.length + unused.length,
                used: used.length,
                unused: unused.length
            }, 
            tags: Object
                .entries(tags)
                .sort((x, y) => y[1] - x[1])
                .slice(0, 10)
        });
    }
});