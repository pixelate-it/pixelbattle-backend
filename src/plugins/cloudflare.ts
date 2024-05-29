import fp from "fastify-plugin";
import CloudFlareAPI from "cloudflare";
import { config } from "../config";

declare module "fastify" {
    interface FastifyInstance {
        cloudflare: CloudFlareAPI;
    }
}

export const cloudflare = fp(async(app) => {
    const api = new CloudFlareAPI({
        apiEmail: config.cloudflare.email,
        apiToken: config.cloudflare.token
    });

    app.decorate('cloudflare', api);

    return;
});