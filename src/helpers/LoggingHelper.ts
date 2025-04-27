type LoginMethod = "Discord";

interface PixelInfo {
    userID: string;
    nickname: string;
    x: number;
    y: number;
    tag: string | null;
    color: string;
    ip: string;
}

interface LoginInfo {
    userID: string;
    nickname: string;
    method: LoginMethod;
    ip: string;
}

export class LoggingHelper {
    static sendPixelPlaced({
        userID,
        nickname,
        color,
        x,
        y,
        tag,
        ip
    }: PixelInfo) {
        console.log(
            `* [PIXEL] ${userID} - ${nickname}; ` +
                `Coordinates: X${x} Y${y}; ` +
                `Color: ${color}; ` +
                `Tag: ${tag}; ` +
                `IP: ${ip}; `
        );
    }

    static sendLoginSuccess({ userID, nickname, method, ip }: LoginInfo) {
        console.log(
            `* [LOGIN] ${userID} - ${nickname}; ` +
                `Method: ${method}; ` +
                `IP: ${ip};`
        );
    }
}
