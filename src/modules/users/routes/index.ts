import type { FastifyInstance } from "fastify";
import { bindUser } from "@core/hooks";
import { getOne } from "./get-one.route";

export function userRoutes(app: FastifyInstance, _: unknown, done: () => void) {
    app.register(async (app) => {
        await app.register(bindUser);

        app.route(getOne);
    });

    done();
}
