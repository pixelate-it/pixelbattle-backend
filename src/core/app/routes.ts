import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { rootRoutes } from "@modules/_root";
import { canvasRoutes } from "@modules/canvas";
import { userRoutes } from "@modules/users";
import { moderatorsRoutes } from "@modules/moderators";
import { loginRoutes } from "@modules/login";

export const routes = fp(async function routes(app: FastifyInstance) {
    app.register(rootRoutes);
    app.register(canvasRoutes, { prefix: "/pixels" });
    app.register(loginRoutes, { prefix: `/login` });
    app.register(userRoutes, { prefix: "/users" });
    app.register(moderatorsRoutes, { prefix: "/moderators" });
});
