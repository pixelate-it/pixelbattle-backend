import fastify from 'fastify';
import { plugins } from './plugins/plugins';
import { routes } from './plugins/routes';
import { cloudflare } from "./plugins/cloudflare";
import { database } from './plugins/db';
import { ipReputation } from './plugins/ipReputation';
import { errorHandler } from './plugins/errorHandler';
import { cache } from './plugins/cache';
import { game } from './plugins/game';
import { oauth2 } from './plugins/oauth2';



async function init() {
    const app = fastify({
        logger: process.env.NODE_ENV === "development",
        pluginTimeout: 300000
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

    await app.register(errorHandler);
    await app.register(plugins);
    await app.register(cloudflare);
    await app.register(database);
    await app.register(ipReputation);
    await app.register(game);
    await app.register(cache);
    await app.register(oauth2);
    await app.register(routes);

    app.listen({ port: process.env.PORT ? parseInt(process.env.PORT) : 8080, path: "0.0.0.0" }).then(console.log);
}

init();