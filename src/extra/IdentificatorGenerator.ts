import process from 'process';

export class IdentificatorGenerator {
    private sequence = 0;
    private lastTimestamp = -1;
    constructor(
        private readonly workerID: number = process.pid,
        private readonly epoch = 1651440000000
    ) {}

    public generate() {
        let timestamp = Date.now();
        if(timestamp === this.lastTimestamp) {
            this.sequence = (this.sequence + 1) & 0xFFF; // 12-bit sequence number
            if(this.sequence === 0) timestamp = this.waitNextMillis(timestamp);
        } else {
            this.sequence = 0;
        }

        this.lastTimestamp = timestamp;

        return ((BigInt(timestamp - this.epoch) << BigInt(22)) |
            (BigInt(this.workerID) << BigInt(12)) |
            BigInt(this.sequence)).toString();
    }

    private waitNextMillis(currentTimestamp: number) {
        let timestamp = Date.now();
        while(timestamp <= currentTimestamp) {
            timestamp = Date.now();
        }
        return timestamp;
    }
}