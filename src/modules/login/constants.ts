import { config } from "@core/config";
import type { CookieSerializeOptions } from "@fastify/cookie";

export const tokenCookieParameters: CookieSerializeOptions = {
    domain: config.redirectUri.split("//")[1].split(":")[0],
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
    path: "/",
    httpOnly: true,
    sameSite: "none",
    secure: true
};

export const idCookieParameters: CookieSerializeOptions = {
    domain: config.frontend.split("//")[1].split(":")[0],
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
    path: "/",
    httpOnly: false,
    sameSite: "none",
    secure: true
};
