import fp from "fastify-plugin";

import { config } from "../config";
import { CanvasManager } from "../managers/CanvasManager";
import { UserManager } from "../managers/UserManager";

type SetType = `${string}-${number}-${number}-${string}`;

declare module "fastify" {
    interface FastifyInstance {
        cache: {
            set: Set<SetType>;
            createInterval: () => void;
            canvasManager: CanvasManager;
            usersManager: UserManager;
            interval?: NodeJS.Timeout;
        }
    }
}

export const cache = fp(async (app) => {
    const canvasManager = new CanvasManager(app.database.pixels, app.game.width, app.game.height);
    const usersManager = new UserManager(app.database.users);

    await canvasManager.init();
    usersManager.handle();

    function updateDatabase() {
        canvasManager.sendPixels();
    }

    async function createInterval() {
        app.cache.interval = setInterval(updateDatabase, config.syncTime);
    }

    const interval = app.game.ended ? undefined : setInterval(updateDatabase, config.syncTime);

    app.decorate("cache", {
        set: new Set<SetType>(),
        createInterval,
        canvasManager,
        usersManager,
        interval
    });

    return;
});