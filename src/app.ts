import mitt, { Emitter, EventType } from 'mitt';
import type { ComponentCallback, ComponentCallbackArgs } from './component';

type LoaderType = string | CallableFunction;
type SyncLoader = ComponentCallback;
type AsyncLoader = [LoaderType | LoaderType[], () => Promise<{ default: ComponentCallback }>];
type Loader = SyncLoader | AsyncLoader;
type LoaderRecord = Record<string, Loader>;

const SPACE_COMMA_REGEX = /[ ,]+/;

class App {
  private readonly components: LoaderRecord;

  private readonly emitter: Emitter<Record<EventType, unknown>>;

  private registeredComponents: Map<HTMLElement, boolean>;

  constructor(components: LoaderRecord) {
    this.components = components;
    this.emitter = mitt();
    this.registeredComponents = new Map();
  }

  private getComponentParams(element: HTMLElement): ComponentCallbackArgs {
    return [element, { app: this, emitter: this.emitter }];
  }

  private mountSyncComponent(element: HTMLElement, component: SyncLoader): void {
    component(...this.getComponentParams(element));
  }

  private mountAsyncComponent(element: HTMLElement, component: AsyncLoader): void {
    const disconnectors: CallableFunction[] = [];
    let events = component[0];
    const callback = component[1];

    if (!Array.isArray(events)) {
      events = typeof events === 'string' ? events.split(SPACE_COMMA_REGEX) : [events];
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

  private mountComponent(element: HTMLElement, component: Loader): void {
    this.registeredComponents.set(element, true);

    if (!Array.isArray(component)) {
      this.mountSyncComponent(element, component);

      return;
    }

    this.mountAsyncComponent(element, component);
  }

  add(components: LoaderRecord): void {
    Object.assign(this.components, components);
  }

  mount(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-component]');

    elements.forEach(async (element) => {
      if (this.registeredComponents.has(element)) {
        return;
      }

      const key = <string>element.dataset.component;

      if (Object.prototype.hasOwnProperty.call(this.components, key)) {
        this.mountComponent(element, this.components[key]);
      }
    });
  }
}

export default App;
