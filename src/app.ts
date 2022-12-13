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

  private readonly emitter: Emitter<Record<EventType, unknown>>;

  constructor(components: LoaderRecord) {
    this.components = new Map();
    this.createdComponents = new Map();
    this.emitter = mitt();

    this.add(components);
  }

  private getComponentParams(element: HTMLElement): ComponentArgs {
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
      events = typeof events === 'string' ? events.split(/[ ,]+/) : [events]; // Comma and space regex
    }

    const loadComponent = async () => {
      disconnectors.forEach((disconnect) => {
        disconnect();
      });

      (await callback()).default(...this.getComponentParams(element));
    };

    events.forEach((event) => {
      if (typeof event === 'function') {
        disconnectors.push(event(element, loadComponent));
      } else {
        const options = <AddEventListenerOptions>{
          once: true,
          passive: true,
        };

        element.addEventListener(event, loadComponent, options);

        disconnectors.push(() => {
          element.removeEventListener(event, loadComponent, options);
        });
      }
    });
  }

  add(components: LoaderRecord): void {
    const keys = Object.keys(components);

    keys.forEach((key) => {
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
