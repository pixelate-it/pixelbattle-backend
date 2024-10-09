export class WebSocketError extends Error {
    public data?: Record<string, unknown>;
}

export class UnsupportedRangeError extends WebSocketError {
    constructor(time: unknown) {
        super();

        this.data = { time };
    }
}

export class UnknownOperationError extends WebSocketError {
    constructor(op: string) {
        super();

        this.data = { op };
    }
}

export class UserCooldownError extends WebSocketError {
    constructor(time: number) {
        super();

        this.data = { time };
    }
}

export class TokenBannedError extends WebSocketError {
    constructor(timeout: number, reason: string | null) {
        super();

        this.data = {
            timeout,
            reason
        };
    }
}

export class IncorrectPixelError extends WebSocketError {
    constructor(x: string | number, y: string | number) {
        super();

        this.data = { x, y };
    }
}
