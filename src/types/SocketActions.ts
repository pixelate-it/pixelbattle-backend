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

    }
}

//export interface SocketClientActions {
//    "PLACE": {
//        x: number,
//        y: number,
//        color: number
//    }
//}

export type SocketPayload<T extends keyof SocketServerActions> = {
    op: T;
} & SocketServerActions[T];