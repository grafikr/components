import type App from './app';
import type { EventStore } from './event-store';

export type Context = {
  app: App;
  dispatchEvent: EventStore['dispatch'];
  useEventHistory: EventStore['history'];
  onMounted: (fn: () => void) => void;
  onTriggered: (fn: () => void) => void;
  scopedQuerySelector<K extends keyof HTMLElementTagNameMap>(
    selectors: K,
  ): HTMLElementTagNameMap[K] | null;
  scopedQuerySelector<K extends keyof SVGElementTagNameMap>(
    selectors: K,
  ): SVGElementTagNameMap[K] | null;
  scopedQuerySelector<K extends keyof MathMLElementTagNameMap>(
    selectors: K,
  ): MathMLElementTagNameMap[K] | null;
  scopedQuerySelector<E extends Element = Element>(selectors: string): E | null;
  scopedQuerySelectorAll<K extends keyof HTMLElementTagNameMap>(
    selectors: K,
  ): NodeListOf<HTMLElementTagNameMap[K]>;
  scopedQuerySelectorAll<K extends keyof SVGElementTagNameMap>(
    selectors: K,
  ): NodeListOf<SVGElementTagNameMap[K]>;
  scopedQuerySelectorAll<K extends keyof MathMLElementTagNameMap>(
    selectors: K,
  ): NodeListOf<MathMLElementTagNameMap[K]>;
  scopedQuerySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
};

export type AppContext = Pick<Context, 'app' | 'dispatchEvent' | 'useEventHistory'>;
