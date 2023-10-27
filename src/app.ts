import type { Context } from './context';
import type { ComponentState } from './component';
import type { Hook } from './hook';
import type { LoaderArguments, LoaderCallback, LoaderList } from './loader';

class App {
  private readonly loaders: Map<string, LoaderArguments>;

  private readonly components: Map<HTMLElement, ComponentState>;

  constructor(components: LoaderList = {}) {
    this.loaders = new Map();
    this.components = new Map();

    this.add(components);
  }

  private static createHook(): Hook {
    const list = new Array<() => void>();

    return {
      list,
      addListener(fn) {
        list.push(fn);
      },
      run() {
        list.forEach((fn) => fn());
      },
    };
  }

  private getContext({ mounted, triggered }: { mounted: Hook; triggered: Hook }): Context {
    return {
      app: this,
      onMounted: mounted.addListener,
      onTriggered: triggered.addListener,
    };
  }

  private createComponent(element: HTMLElement, args: LoaderArguments): void {
    const mounted = App.createHook();
    const triggered = App.createHook();
    const context = this.getContext({ mounted, triggered });

    this.components.set(element, 'created');

    if (Array.isArray(args)) {
      const events = Array.isArray(args[0]) ? args[0] : [args[0]];
      const component = args[1];

      const mountComponent = async () => {
        if (this.components.get(element) === 'created') {
          (await component()).default(element, context);

          this.components.set(element, 'mounted');
          mounted.run();
        }

        triggered.run();
      };

      const executeCustomLoader = (event: LoaderCallback | string) => {
        if (typeof event === 'function') {
          event({ node: element, ...context }, mountComponent);
        } else {
          element.addEventListener(event, mountComponent);
        }
      };

      events.forEach(executeCustomLoader);
    } else {
      args(element, context);
      this.components.set(element, 'mounted');

      mounted.run();
      triggered.run();
    }
  }

  add(components: LoaderList = {}): void {
    Object.keys(components).forEach((key) => {
      const component = components[key];

      if (component) {
        this.loaders.set(key, component);
      }
    });
  }

  mount(root: HTMLElement | Document = document): void {
    const elements = root.querySelectorAll<HTMLElement>('[data-component]');

    elements.forEach(async (element) => {
      // Check if component is already mounted
      if (this.components.has(element)) {
        return;
      }

      // Check if loader exists
      const loader = this.loaders.get(<string>element.dataset.component);
      if (!loader) {
        return;
      }

      this.createComponent(element, loader);
    });
  }
}

export default App;
