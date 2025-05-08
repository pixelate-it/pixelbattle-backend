import type { RouteOptions } from "fastify";

export const getTags: RouteOptions = {
    method: "GET",
    url: "/tag",
    config: {
        rateLimit: {
            max: 2,
            timeWindow: 5000
        }
    },
    async handler(request, response) {
        const pixels = request.server.cache.canvasService.pixels;
        const data = {
            used: 0,
            unused: 0,
            tags: {} as Record<string, number>
        };

        for (const pixel of pixels) {
            if (pixel.tag === null) {
                data.unused++;
                continue;
            }
            data.tags[pixel.tag] = (data.tags[pixel.tag] || 0) + 1;
            data.used++;
        }

        const top = Object.entries(data.tags).reduce(
            (top, [tag, count]) => {
                if (top.length < 10 || count > top[9][1]) {
                    top.push([tag, count]);
                    top.sort((a, b) => b[1] - a[1]);
                    if (top.length > 10) top.pop();
                }
                return top;
            },
            [] as [string, number][]
        );

        return response.send({
            pixels: {
                all: data.unused + data.used,
                used: data.used,
                unused: data.unused
            },
            tags: top
        });
    }
};
