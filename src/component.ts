import type App from './app';

export type ComponentArgs = [
  node: HTMLElement,
  context: {
    app: App;
    emitter: App['emitter'];
  },
];

export type ComponentLoaderArgs = [
  context: {
    node: HTMLElement;
    emitter: App['emitter'];
  },
  load: () => Promise<void>,
];

export type ComponentType = (...args: ComponentArgs) => void;

export type ComponentLoaderType = (...args: ComponentLoaderArgs) => () => void;
