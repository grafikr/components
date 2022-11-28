import mitt, { Emitter, EventType } from 'mitt';
import type { ComponentArgs, ComponentType } from './component';

type LoaderEventType = string | CallableFunction;
type SyncLoaderType = ComponentType;
type AsyncLoaderType = [LoaderEventType | LoaderEventType[], () => Promise<{ default: ComponentType }>];
type LoaderRecord = Record<string, SyncLoaderType | AsyncLoaderType>;

const SPACE_COMMA_REGEX = /[ ,]+/;

class App {
  private readonly components: LoaderRecord;

  private createdComponents: Map<HTMLElement, boolean>;

  private readonly emitter: Emitter<Record<EventType, unknown>>;

  constructor(components: LoaderRecord) {
    this.components = components;
    this.createdComponents = new Map();
    this.emitter = mitt();
  }

  private createComponent(element: HTMLElement): void {
    this.createdComponents.set(element, true);
  }

  private isComponentCreated(element: HTMLElement): boolean {
    return this.createdComponents.has(element)
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

  add(components: LoaderRecord): void {
    Object.assign(this.components, components);
  }

  mount(): void {
    const elements = document.querySelectorAll<HTMLElement>('[data-component]');

    elements.forEach(async (element) => {
      const key = <string>element.dataset.component;

      // TODO: Refactor to map
      if (!Object.prototype.hasOwnProperty.call(this.components, key)) {
        return;
      }

      if (this.isComponentCreated(element)) {
        return;
      }

      this.createComponent(element);
      const component = this.components[key];

      if (Array.isArray(component)) {
        this.mountAsyncComponent(element, component);
      } else {
        this.mountSyncComponent(element, component);
      }
    });
  }
}

export default App;
