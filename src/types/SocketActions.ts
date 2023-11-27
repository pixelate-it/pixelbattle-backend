export interface SocketServerActions {
    "PLACE": {
        x: number;
        y: number;
        color: string;
    };
    "ENDED": {
        value: boolean;
    }
}

export type SocketPayload<T extends keyof SocketServerActions> = {
    op: T;
} & SocketServerActions[T]