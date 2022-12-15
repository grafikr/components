import mitt, { Emitter, EventType } from 'mitt';
import type { ComponentArgs, ComponentLoaderType, ComponentType } from './component';

type LoaderEventType = string | ComponentLoaderType;
type SyncLoaderType = ComponentType;
type AsyncLoaderType = [
  LoaderEventType | LoaderEventType[],
  () => Promise<{ default: ComponentType }>
];
type LoaderRecord = Record<string, SyncLoaderType | AsyncLoaderType>;

class App {
  private readonly components: Map<string, SyncLoaderType | AsyncLoaderType>;

  private createdComponents: Map<HTMLElement, boolean>;

  readonly emitter: Emitter<Record<EventType, unknown>>;

  private readonly eventListenerOptions: AddEventListenerOptions;

  constructor(components: LoaderRecord) {
    this.components = new Map();
    this.createdComponents = new Map();
    this.emitter = mitt();

    this.eventListenerOptions = {
      once: true,
      passive: true,
    };

    this.add(components);
  }

  private getComponentParams(element: ComponentArgs[0]): ComponentArgs {
    return [element, { app: this, emitter: this.emitter }];
  }

  private mountSyncComponent(element: HTMLElement, component: SyncLoaderType): void {
    component(...this.getComponentParams(element));
  }

  private mountAsyncComponent(element: HTMLElement, component: AsyncLoaderType): void {
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
        disconnectors.push(
          event(
            {
              node: element,
              emitter: this.emitter,
            },
            loadComponent
          )
        );
      } else {
        element.addEventListener(event, loadComponent, this.eventListenerOptions);

        disconnectors.push(() => {
          element.removeEventListener(event, loadComponent, this.eventListenerOptions);
        });
      }
    });
  }

  add(components: LoaderRecord): void {
    Object.keys(components).forEach((key) => {
      this.components.set(key, components[key]);
    });
  }

  mount(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-component]');

    elements.forEach(async (element) => {
      const key = <string>element.dataset.component;

      if (this.createdComponents.has(element)) {
        return;
      }

      const component = this.components.get(key);

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
