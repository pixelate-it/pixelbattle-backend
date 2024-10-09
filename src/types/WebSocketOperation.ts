export interface WebSocketErrorResponse<T = Record<string, unknown>> {
    message: string;
    reason: string;
    data?: T;
}

export interface UnsupportedOperationMessage {
    reason: "UnsupportedOperation";
    data?: { op: string };
}

export interface SocketClientActions {
    PLACE: {
        x: number;
        y: number;
        color: string;
    };

    PING: {
        time: number;
    };
}

export interface SocketServerActions {
    PLACE: {
        x: number;
        y: number;
        color: string;
    };

    PONG: {
        time: number;
    };
}

export type SocketClientPayload<T extends keyof SocketClientActions> = {
    op: T;
} & SocketClientActions[T];

export type SocketServerPayload<T extends keyof SocketServerActions> = {
    op: T;
} & SocketServerActions[T];
