import type { Context } from './context';

export type ComponentCallback = (node: HTMLElement, context: Context) => void;

export type ComponentState = 'created' | 'mounted';

function Component(fn: ComponentCallback) {
  return fn;
}

export default Component;
