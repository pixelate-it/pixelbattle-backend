import { v4 as uuidv4 } from 'uuid';

export const utils = {
    generateToken(date: number | null = null) {
        return `${(uuidv4() + '.' + uuidv4()).replace(/-/g, '')}.${(date ?? Date.now()).toString(36)}`; // length = 72 (static)
    },
    translateHex(hex: string) {
        const R = parseInt(hex.slice(1, 3), 16);
        const G = parseInt(hex.slice(3, 5), 16);
        const B = parseInt(hex.slice(5, 7), 16);

        return [R, G, B];
    },
    translateRGB(rgb: Uint8Array | number[]) {
        return '#' + [...rgb].map(f => f.toString(16)).join('');
    }
}