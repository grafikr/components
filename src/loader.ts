import type { ArrayMaybe } from './helpers';
import type { ComponentCallback } from './component';
import type { Context } from './context';

export type LoaderCallback = (
  context: { node: HTMLElement } & Context,
  load: () => Promise<void>,
) => void;

export type SyncLoaderArguments = ComponentCallback;

export type AsyncLoaderArguments = [
  ArrayMaybe<LoaderCallback | string>,
  () => Promise<{ default: ComponentCallback }>,
];

export type LoaderArguments = SyncLoaderArguments | AsyncLoaderArguments;

export type LoaderList<R = Record<string, LoaderArguments>> = R;

const Loader = (fn: LoaderCallback) => fn;

export default Loader;
