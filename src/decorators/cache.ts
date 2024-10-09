import fp from "fastify-plugin";
import { CanvasManager } from "managers/CanvasManager";
import { UserManager } from "managers/UserManager";
import { config } from "../config";

declare module "fastify" {
    interface FastifyInstance {
        cache: {
            createInterval: () => void;
            canvasManager: CanvasManager;
            usersManager: UserManager;
            interval: Timer | false;
        };
    }
}

export const cache = fp(async function cache(app) {
    const canvasManager = new CanvasManager(
        app.database.pixels,
        app.game.width,
        app.game.height
    );
    const usersManager = new UserManager(app.database.users);

    await canvasManager.init();
    usersManager.handle();

    function updateDatabase() {
        canvasManager.sendPixels();
    }

    async function createInterval() {
        app.cache.interval = setInterval(updateDatabase, config.syncTime);
    }

    const interval =
        !app.game.ended && setInterval(updateDatabase, config.syncTime);

    app.decorate("cache", {
        createInterval,
        canvasManager,
        usersManager,
        interval
    });
});
