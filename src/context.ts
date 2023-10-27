import type App from './app';

export type Context = {
  app: App;

  // Hooks
  onMounted: (fn: () => void) => void;
  onTriggered: (fn: () => void) => void;
};
