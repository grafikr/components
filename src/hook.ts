export type Hook = { list: (() => void)[]; addListener: (fn: () => void) => void; run: () => void };
