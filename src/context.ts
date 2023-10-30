import type App from './app';
import type { EventStore } from './event-store';

export type Context = {
  app: App;
  dispatchEvent: EventStore['dispatch'];
  useEventHistory: EventStore['history'];
  onMounted: (fn: () => void) => void;
  onTriggered: (fn: () => void) => void;
};
