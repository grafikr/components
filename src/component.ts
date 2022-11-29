import type { Emitter, EventType } from 'mitt';
import type App from './app';

export type ComponentArgs = [
  node: HTMLElement,
  context: {
    app: App;
    emitter: Emitter<Record<EventType, unknown>>;
  }
];

export type ComponentType = (...args: ComponentArgs) => void;

export type ComponentLoaderType = (node: HTMLElement, load: () => Promise<void>) => () => void;
