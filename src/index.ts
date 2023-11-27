

import fastify from 'fastify';
import { plugins } from './plugins/plugins';
import { routes } from './plugins/routes';
import { database } from './plugins/db';
import { ApiError } from './errors';
import fastifyCors from '@fastify/cors';
import { ApiErrorResponse } from './types/ApiReponse';
import { errorHandler } from './plugins/errorHandler';



async function init() {
    const app = fastify({
        logger: true,
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
    await app.register(routes)

    app.listen({ port: 9000, path: "0.0.0.0" }).then(console.log)
}

init()