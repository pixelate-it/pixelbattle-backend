import fp from "fastify-plugin";
import { CanvasRepository } from "@modules/canvas";
import { UserRepository } from "@modules/users";

declare module "fastify" {
    interface FastifyInstance {
        repository: {
            canvas: CanvasRepository;
            users: UserRepository;
        };
    }
}

export const repository = fp(
    async (app) => {
        app.decorate("repository", {
            canvas: new CanvasRepository(app.database.pixels),
            users: new UserRepository(app.database.users)
        });
    },
    { name: "repository", dependencies: ["database"] }
);
