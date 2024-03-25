import { FastifyInstance } from "fastify";
import { bans } from "../routes/bans_________F";
import { info } from "../routes/game________O";
import { moderators } from "../routes/moderators__O";
import { pixels } from "../routes/pixels_________L";
import { users } from "../routes/users_________S";
import { favicon } from "../routes/im_colorblind";
import { really_useless_thing } from "../routes/really_useless_thing";
import { introduce_yourself } from "../routes/introduce_yourself";
import fp from "fastify-plugin";

export const routes = fp(async (app: FastifyInstance) => {
    app.register(bans, { prefix: "/bans" });
    app.register(info, { prefix: "/game" });
    app.register(moderators, { prefix: "/moderators" });
    app.register(pixels, { prefix: "/pixels" });
    app.register(users, { prefix: "/users" });

    app.route(favicon);
    app.route(really_useless_thing);
    app.route(introduce_yourself);

    return;
});