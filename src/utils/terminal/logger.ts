import type { PixelInfo, LoginInfo } from "./types";

export const pixelPlace = ({
    userID,
    nickname,
    color,
    x,
    y,
    tag,
    ip
}: PixelInfo) =>
    console.log(
        `* [PIXEL] ${userID} - ${nickname}; ` +
            `Coordinates: X${x} Y${y}; ` +
            `Color: ${color}; ` +
            `Tag: ${tag}; ` +
            `IP: ${ip}; `
    );

export const loginComplete = ({ userID, nickname, method, ip }: LoginInfo) =>
    console.log(
        `* [LOGIN] ${userID} - ${nickname}; ` +
            `Method: ${method}; ` +
            `IP: ${ip};`
    );
