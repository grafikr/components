import type App from './app';

export type ComponentArgs = [
  node: HTMLElement,
  context: {
    app: App;
    emitter: App['emitter'];
  }
];

export type ComponentType = (...args: ComponentArgs) => void;

export type ComponentLoaderType = (
  context: {
    node: HTMLElement;
    emitter: App['emitter'];
  },
  load: () => Promise<void>
) => () => void;
