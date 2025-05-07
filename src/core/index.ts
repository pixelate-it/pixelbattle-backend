import fastify from "fastify";
import { konsole } from "utils";
import { database, game, cache } from "@core/extensions";
import { plugins, routes } from "@core/app";

import "./hello";

const app = fastify({
    logger: process.env.NODE_ENV === "development",
    pluginTimeout: 180000
});

(async () => {
    for (const decorator of [plugins, database, game, cache, routes]) {
        konsole.write(`Loading "${decorator.name}" plugin...`);
        await app.register(decorator);
        konsole.clearLine();
        konsole.returnCursor();
    }

    console.log("All plugins successfully loaded!");

    app.listen({
        host: "0.0.0.0",
        port: process.env.PORT ? parseInt(process.env.PORT) : 8080
    }).then(console.log);
})();
