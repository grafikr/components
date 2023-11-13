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
import { Component } from '@grafikr/components';

export default Component((node, { app }) => {
  console.log(node); // The DOM element
  console.log(app); // The app instance
});
```

Then you have to register your component.

```typescript
import { App } from '@grafikr/components';

const app = new App({
  // Async component (Recommended)
  'async-component': ['mouseenter', () => import('components/async-component')],

  // Synced component
  'sync-component': require('components/sync-component'),
});

app.mount();
```

Then you have to create the DOM elements.

```html
<div data-component="my-component"></div>
```

### Loaders

#### Creating custom loader

Sometimes default pointer events is not good enough to load your component. You may want to load it when it's visible the viewport, or when a certain event is emitted.

To create a custom loader you will first have to create the loader. 

The first argument passed is of type `{ node: HTMLElement } & Context`. The second argument is an async function which mounts the component.

```typescript
import { Loader } from '@grafikr/components';

export default Loader(({ node }, load) => {
  // Add a event.
  // You can use `node` and `emitter` here.
  document.addEventListener('my-custom-event', load);

  // Return a function which disconnects the listeners.
  // This is useful when using multiple loaders.
  return () => {
    document.removeEventListener('my-custom-event', load);
  };
});
```

Then you have to register the loader for the component.

```typescript
import CustomLoader from 'loaders/my-custom-loader';

const app = new App({
  'component': [
    CustomLoader,
    () => import('components/component'),
  ],
});

app.mount();
```

#### Using multiple loaders

It's very easy to add multiple loaders. You can combine multiple loaders by passing an array.

```typescript
const app = new App({
  'component': [
    ['mouseenter', 'click'],
    () => import('components/component')
  ],

  'other-component': [
    [customLoader, anotherCustomLoader, 'mouseenter'],
    () => import('components/other-component'),
  ],
});

app.mount();
```

### Context object

#### `app`
The app instance.

```typescript
Component((node, { app }) => {
  ...
});
```

#### `dispatchEvent`
A wrapper around `document.dispatchEvent`. Is used to store past events received in `useEventHistory`.

```typescript
Component((node, { dispatchEvent }) => {
  dispatchEvent('event-name', any)
});
```

### `useEventHistory`
A function which takes in a function which gets called with all past events, up until the component is mounted.

```typescript
Component((node, { useEventHistory }) => {
  useEventHistory((events) => {
    events.forEach(([event, payload]) => {
      // event? Name of the event
      // payload? The payload sent to the event
      
      ...  
    });
  })
});
```

#### `onMounted`
A function which takes in a function which get called when the component is initially mounted.

```typescript
Component((node, { onMounted }) => {
  onMounted(() => {
    ...
  })
});
```

#### `onTriggered`
A function which takes in a function which get called every time is triggered by a loader.

```typescript
Component((node, { onTriggered }) => {
  onTriggered(() => {
    ...
  })
});
```

### Typed events for `dispatchEvent` and `useEventHistory`

To add types for `dispatchEvent` and `useEventHistory`, you can add a `.d.ts` file with the following code:

```typescript
type CustomEventMap = {
  'typed-event': any;
};

type AppEvent = Array<
  { [K in keyof CustomEventMap]: [K, CustomEventMap[K]] }[keyof CustomEventMap]
>;

declare module '@grafikr/components' {
  export interface EventStore {
    dispatch<K extends keyof CustomEventMap>(type: K, payload: CustomEventMap[K]): void;
    history(fn: (events: AppEvent) => void, filter?: string | string[]): void;
  }
}

export {};
```
