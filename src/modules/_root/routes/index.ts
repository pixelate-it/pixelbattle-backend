import fp from "fastify-plugin";
import { root } from "./root.route";
import { favicon } from "./favicon.route";

export const rootRoutes = fp(async (app) => {
    app.route(root);
    app.route(favicon);
});
