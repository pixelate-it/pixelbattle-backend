import fp from "fastify-plugin";
import { config } from "../config";

export const ipReputation = fp(async (app) => {
    app.database.banned_ips.watch([]).on("change", async (data) => {
        switch (data.operationType) {
            case "insert": {
                const { documentKey } = data;

                await app.cloudflare.rules.lists.items.create(
                    config.cloudflare.list_id,
                    {
                        account_id: config.cloudflare.id,
                        body: [
                            {
                                ip: documentKey._id,
                                comment: `Banned at ${new Date()
                                    .toISOString()
                                    .split(".")[0]
                                    .replace(/T/, " ")}`
                            }
                        ]
                    }
                );

                break;
            }

            case "delete": {
                const { documentKey } = data;

                const banned_list = await app.cloudflare.rules.lists.items.list(
                    config.cloudflare.list_id,
                    { account_id: config.cloudflare.id }
                );

                const item = (
                    banned_list.result as {
                        id: string;
                        ip: string;
                        comment?: string;
                        created_on: string;
                        modified_on: string;
                    }[]
                ).find((ban) => ban.ip === documentKey._id);
                if (!item) return;

                await app.cloudflare.rules.lists.items.delete(
                    config.cloudflare.list_id,
                    { account_id: config.cloudflare.id },
                    {
                        body: {
                            items: [
                                {
                                    id: item.id
                                }
                            ]
                        }
                    }
                );

                break;
            }

            default:
                break;
        }
    });
});
