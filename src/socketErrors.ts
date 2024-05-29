import { SocketServerPayload } from "./types/SocketActions";

export class SocketError extends Error {
    public payload!: object;
}

export class UnknownOperationError extends  SocketError {
    constructor() {
        super();

        this.payload = {
            op: 'OP?'
        } as SocketServerPayload<'OP?'>;
    }
}

export class UserCooldownError extends SocketError {
    constructor(time: number, id: string) {
        super();

        this.payload = {
            op: 'COOLDOWN',
            time, id
        } as SocketServerPayload<'COOLDOWN'>;
    }
}

export class TokenBannedError extends SocketError {
    constructor(timeout: number, reason: string | null) {
        super();

        this.payload = {
            op: 'BANNED',
            timeout, reason
        } as SocketServerPayload<'BANNED'>;
    }
}

export class IncorrectPixelError extends SocketError {
    constructor(id: string) {
        super();

        this.payload = {
            op: 'INC_PIXEL', id
        } as SocketServerPayload<'INC_PIXEL'>;
    }
}