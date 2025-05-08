import fp from "fastify-plugin";
import { CanvasService } from "@modules/canvas";
import { UserService } from "@modules/users";

declare module "fastify" {
    interface FastifyInstance {
        cache: {
            canvasService: CanvasService;
            usersService: UserService;
        };
    }
}

export const cache = fp(
    async function cache(app) {
        const canvasService = new CanvasService(
            app.repository.canvas,
            app.game.width,
            app.game.height
        );
        const usersService = new UserService(app.repository.users);

        await canvasService.init();
        usersService.startAutoCleanup();

        app.decorate("cache", {
            canvasService,
            usersService
        });
    },
    {
        name: "cache",
        dependencies: ["database", "repository"]
    }
);
