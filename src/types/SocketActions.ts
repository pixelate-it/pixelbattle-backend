export interface SocketServerActions {
    "PLACE": {
        x: number;
        y: number;
        color: string;
    };
    "ENDED": {
        value: boolean;
    },
    "BANNED": {
        timeout: number;
        reason: string | null;
    },
    "COOLDOWN": {
        time: number;
        id: string;
    },
    "INC_PIXEL": {
        id: string
    },
    "OP?" : {}
}

export interface SocketClientActions {
    "PLACE": {
        id?: string,
        x: number,
        y: number,
        color: string
    }
}

export type SocketServerPayload<T extends keyof SocketServerActions> = {
    op: T;
} & SocketServerActions[T];

export type SocketClientPayload<T extends keyof SocketClientActions> = {
    op: T;
} & SocketClientActions[T];