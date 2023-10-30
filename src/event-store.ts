export type EventStoreEvent = [string, any];

export type EventStore = {
  list: Array<EventStoreEvent>;
  dispatch: <K extends string, P = any>(type: K, payload: P) => void;
  history: (fn: (events: Array<EventStoreEvent>) => void, filter?: string | string[]) => void;
};
