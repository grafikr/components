import type { Emitter, EventType } from 'mitt';
import type App from './app';

export type ComponentCallbackArgs = [
  node: HTMLElement,
  context: {
    app: App;
    emitter: Emitter<Record<EventType, unknown>>;
  }
];

export type ComponentLoaderArgs = (
  node: HTMLElement,
  load: () => Promise<void>
) => CallableFunction;

export type ComponentCallback = (...args: ComponentCallbackArgs) => void;

export default (component: ComponentCallback) =>
  (...args: ComponentCallbackArgs) => {
    component(...args);
  };

export const ComponentLoader = (callback: ComponentLoaderArgs) => callback;
