// lol konsole is a reference to kde? xD

export const write = (
    data: Blob | NodeJS.TypedArray | ArrayBufferLike | string | Bun.BlobPart[]
) => Bun.write(Bun.stdout, data);

// alternative to process.stdout.clearLine(0)
export const clearLine = () => write("\u001b[2K");
// alternative to process.stdout.cursorTo(0)
export const returnCursor = () => write("\u001b[0G");
