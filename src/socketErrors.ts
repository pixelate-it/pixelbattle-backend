import { SocketConnection } from "./helpers/SocketHelper";
import { SocketPayload } from "./types/SocketActions";

export class SocketError extends Error {
    public payload!: object;
}

export class UserCooldownError extends SocketError {
    constructor(time: number, id: string) {
        super();

        this.payload = {
            op: 'COOLDOWN',
            time, id
        } as SocketPayload<'COOLDOWN'>;
    }
}

export class TokenBannedError extends SocketError {
    constructor(timeout: number, reason: string | null) {
        super();

        this.payload = {
            op: 'BANNED',
            timeout, reason
        } as SocketPayload<'BANNED'>;
    }
}

export class IncorrectPixelError extends SocketError {
    constructor() {
        super();

        this.payload = {
            op: 'INC_PIXEL'
        } as SocketPayload<'INC_PIXEL'>;
    }
}