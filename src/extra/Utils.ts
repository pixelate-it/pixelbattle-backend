import { v4 as uuidv4 } from 'uuid';

export const utils = {
    generateToken(date: number | null = null) {
        return `${(uuidv4() + '.' + uuidv4()).replace(/-/g, '')}.${(date ?? Date.now()).toString(36)}`; // length = 72 (static)
    },
    translateHex(hex: string) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        return [r, g, b];
    },
    translateRGB(rgb: number[]) {
        return '#' + rgb.map(f => f.toString(16)).join('');
    }
}