import fp from "fastify-plugin";

import { config } from "../config";
import { CanvasManager } from "../managers/CanvasManager";
import { UserManager } from "../managers/UserManager";

declare module "fastify" {
    interface FastifyInstance {
        cache: {
            interval?: NodeJS.Timeout;
            canvasManager: CanvasManager;
            usersManager: UserManager;
            map: Map<`${string}-${number}-${number}-${string}`, boolean>;
            createInterval: () => void;
        }
    }
}

export const cache = fp(async (app) => {
    const canvasManager = new CanvasManager(app.database.pixels);
    const usersManager = new UserManager(app.database.users);

    await canvasManager.init(app.game.width, app.game.height);
    usersManager.handle();

    async function updateDatabase() {
        await canvasManager.sendPixels();
    }

    async function createInterval() {
        app.cache.interval = setInterval(updateDatabase, config.syncTime);
    }

    const interval = app.game.ended ? undefined : setInterval(updateDatabase, config.syncTime);

    app.decorate("cache", {
        interval: interval,
        createInterval: createInterval,
        usersManager: usersManager,
        canvasManager: canvasManager,
        map: new Map()
    });
});