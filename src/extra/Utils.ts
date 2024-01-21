import { v4 as uuidv4 } from 'uuid';

export const utils = {
    generateToken(date: number | null = null) {
        const token = `${uuidv4()}.${(date ?? Date.now()).toString(36)}.${uuidv4()}`

        return token; // на данный момент у токена фиксированная длинна 82 символа!
    },
    translateHex(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return [r, g, b];
    }
}