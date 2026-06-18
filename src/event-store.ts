export type Events = [string, unknown];

export interface EventStore {
  list: Array<Events>;
  dispatch(type: string, payload: unknown): void;
  history(fn: (events: Array<Events>) => void, filter?: string | string[]): void;
}
