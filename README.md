# Components

### What is Components?

Components is a microframework meant to mount code on top of a DOM element. Components encourage lazyloading of all modules by utilizating events to load the components. However, you are not locked into this behaivor.

## Installation

```bash
$ yarn add @grafikr/components
```

## Usage

First you have to create a new component.

```typescript
import type { ComponentType } from '@grafikr/components';

const Component: ComponentType = (node, { app, emitter }) => {
  console.log(node); // The DOM element
  console.log(app); // The app instance
  console.log(emitter); // Event emitter
};

export default Component;
```

Then you have to register your component.

```typescript
import { App } from '@grafikr/components';

const app = new App({
  // Async (Recommended), loaded on element mouseenter event
  'my-component': ['mouseenter', () => import('components/my-component')],

  // Sync, loaded immediately
  'my-component': require('components/my-component'),
});

app.mount();
```

Then you have to create the DOM elements.

```html
<div data-component="my-component"></div>
```

#### Creating custom loader

Sometimes default pointer events is not good enough to load your component. You may want to load it when it's visible the viewport, or when a certain event is emitted.

To create a custom loader you will first have to create the loader.

```typescript
import type { ComponentLoaderType } from '@grafikr/components';

const Loader: ComponentLoaderType = ({ node, emitter }, load) => {
  // Add a event.
  // You can use `node` and `emitter` here.
  document.addEventListener('my-custom-event', load);

  // Return a function which disconnects the listeners.
  // This is useful when using multiple loaders.
  return () => {
    document.removeEventListener('my-custom-event', load);
  };
};

export default Loader;
```

Then you have to register the loader for the component.

```typescript
import myCustomLoader from 'loaders/my-custom-loader',

const app = new App({
  'my-component': [
    myCustomLoader,
    () => import('components/my-component'),
  ],
});
```

#### Using multiple loaders

It's very easy to add multiple loaders. If you just use regular events emitted from the node itself, you can pass a string with these, or if you want to combine multiple custom loaders with regular events, you can use an array.

```typescript
const app = new App({
  'my-component': ['mouseenter click', () => import('components/my-component')],

  'my-component': [
    [myCustomLoader, myOtherCustomLoader, 'mouseenter'],
    () => import('components/my-component'),
  ],
});
```
