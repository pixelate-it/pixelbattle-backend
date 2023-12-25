

import fastify from 'fastify';
import { plugins } from './plugins/plugins';
import { routes } from './plugins/routes';
import { database } from './plugins/db';
import { errorHandler } from './plugins/errorHandler';
import { cache } from './plugins/cache';
import { game } from './plugins/game';



async function init() {
    const app = fastify({
        logger: process.env.NODE_ENV === "development",
    });

    [
        '  _____    _                 _           _              _____   _     _ ',
        ' |  __ \\  (_)               | |         | |            |_   _| | |   | |',
        ' | |__) |  _  __  __   ___  | |   __ _  | |_    ___      | |   | |_  | |',
        ' |  ___/  | | \\ \\/ /  / _ \\ | |  / _` | | __|  / _ \\     | |   | __| | |',
        ' | |      | |  >  <  |  __/ | | | (_| | | |_  |  __/    _| |_  | |_  |_|',
        ' |_|      |_| /_/\\_\\  \\___| |_|  \\__,_|  \\__|  \\___|   |_____|  \\__| (_)',
        '                                                                        ',
        ' by mirdukkkkk & Pixelate It Team                                       ',
        '                                                                        '
    ].map(str => console.log(str));

    await app.register(errorHandler)
    await app.register(plugins)
    await app.register(database)
    await app.register(game)
    await app.register(cache)
    await app.register(routes)

    app.listen({ port: process.env.PORT ? parseInt(process.env.PORT) : 8080, path: "localhost" }).then(console.log)
}

init()