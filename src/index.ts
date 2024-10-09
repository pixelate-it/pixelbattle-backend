import fastify from "fastify";
import * as konsole from "utils/konsole";
import {
    database,
    game,
    routes,
    plugins,
    errorHandler,
    cache,
    oauth2,
    cloudflare,
    ipReputation
} from "./decorators";

import "./utils/hello";

const app = fastify({
    logger: process.env.NODE_ENV === "development",
    pluginTimeout: 180000
});

(async () => {
    for (const decorator of [
        errorHandler,
        plugins,
        cloudflare,
        database,
        ipReputation,
        game,
        cache,
        oauth2,
        routes
    ]) {
        konsole.write(`Loading "${decorator.name}" plugin...`);
        await app.register(decorator);
        konsole.clearLine();
        konsole.returnCursor();
    }

    console.log("All plugins successfully loaded!");

    app.listen({
        port: process.env.PORT ? parseInt(process.env.PORT) : 8080
    }).then(console.log);
})();
