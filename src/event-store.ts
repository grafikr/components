export type Events = [string, any];

export interface EventStore {
  list: Array<Events>;
  dispatch(type: string, payload: any): void;
  history(fn: (events: Array<Events>) => void, filter?: string | string[]): void;
}
