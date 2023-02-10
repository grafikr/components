import mitt, { Emitter, EventType } from 'mitt';
import type {
  ComponentArgs,
  ComponentLoaderArgs,
  ComponentLoaderType,
  ComponentType,
} from './component';

module App {
  export type LoaderEventType = string | ComponentLoaderType;
  export type SyncLoaderType = ComponentType;
  export type AsyncLoaderType = [
      LoaderEventType | LoaderEventType[],
    () => Promise<{ default: ComponentType }>
  ];
  export type LoaderRecord = Record<string, SyncLoaderType | AsyncLoaderType>;
}

class App<Events extends Record<EventType, unknown> =Record<EventType, unknown>> {
  private readonly components: Map<string, App.SyncLoaderType | App.AsyncLoaderType>;

  private createdComponents: Map<HTMLElement, boolean>;

  readonly emitter: Emitter<Events>;

  private readonly eventListenerOptions: AddEventListenerOptions;

  constructor(components: App.LoaderRecord) {
    this.add = this.add.bind(this);
    this.mount = this.mount.bind(this);

    this.components = new Map();
    this.createdComponents = new Map();
    this.emitter = mitt<Events>();

    this.eventListenerOptions = {
      once: true,
      passive: true,
    };

    this.add(components);
  }

  private getComponentParams(element: ComponentArgs[0]): ComponentArgs {
    return [element, { app: this, emitter: this.emitter }];
  }

  private getLoaderParams(
    element: ComponentLoaderArgs[0]['node'],
    callback: ComponentLoaderArgs[1]
  ): ComponentLoaderArgs {
    return [{ node: element, emitter: this.emitter }, callback];
  }

  private mountSyncComponent(element: HTMLElement, component: App.SyncLoaderType): void {
    component(...this.getComponentParams(element));
  }

  private mountAsyncComponent(element: HTMLElement, component: App.AsyncLoaderType): void {
    const disconnectors: CallableFunction[] = [];
    let events = component[0];
    const callback = component[1];

    if (!Array.isArray(events)) {
      events = typeof events === 'string' ? events.split(' ') : [events];
    }

    const loadComponent = async () => {
      disconnectors.forEach((disconnect) => {
        disconnect();
      });

      (await callback()).default(...this.getComponentParams(element));
    };

    events.forEach((event) => {
      if (typeof event === 'function') {
        disconnectors.push(event(...this.getLoaderParams(element, loadComponent)));
      } else {
        element.addEventListener(event, loadComponent, this.eventListenerOptions);

        disconnectors.push(() => {
          element.removeEventListener(event, loadComponent, this.eventListenerOptions);
        });
      }
    });
  }

  add(components: App.LoaderRecord): void {
    Object.keys(components).forEach((key) => {
      this.components.set(key, components[key]);
    });
  }

  mount(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-component]');

    elements.forEach(async (element) => {
      if (this.createdComponents.has(element)) {
        return;
      }

      const component = this.components.get(<string>element.dataset.component);

      if (typeof component === 'undefined') {
        return;
      }

      this.createdComponents.set(element, true);

      if (Array.isArray(component)) {
        this.mountAsyncComponent(element, component);
      } else {
        this.mountSyncComponent(element, component);
      }
    });
  }
}

export default App;
