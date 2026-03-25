# vue-hasty-team

A Vue 3 component for building interactive org charts and team hierarchy diagrams. Nodes can be dragged from a palette onto the canvas, rearranged within the tree, and connected automatically with arrows. The canvas supports pan and zoom.

A live demo is published at [tak-ps.github.io/vue-hasty-team](https://tak-ps.github.io/vue-hasty-team/).

## Installation

```
npm install @tak-ps/vue-hasty-team
```

## Basic usage

The library exports a single component, `HastyTeam`. It takes a tree of nodes through `v-model` and uses a scoped slot to render each node however you like.

```vue
<template>
    <HastyTeam
        v-model="tree"
        @drop:root="onDropRoot"
        @drop:node="onDropNode"
    >
        <template #block="{ node, dragover, draggingSelf }">
            <div
                :style="{ opacity: draggingSelf ? 0.4 : 1 }"
                :class="{ highlight: dragover }"
            >
                {{ node.label }}
            </div>
        </template>
    </HastyTeam>
</template>

<script setup>
import { ref } from 'vue';
import { HastyTeam } from '@tak-ps/vue-hasty-team';

const tree = ref({});
</script>
```

## Data shape

The `modelValue` is a recursive tree object:

```js
{
    self: {
        id: 'unique-string',   // required — used to track identity during drag
        // any other properties you need
    },
    children: [
        {
            self: { id: '...', /* ... */ },
            children: []
        }
    ]
}
```

An empty object `{}` is a valid starting value and represents an empty canvas. When the first node is dropped, `drop:root` fires so you can populate `self`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | Object | required | The tree data object described above |
| `debug` | Boolean | `false` | Renders the raw JSON of `modelValue` below the canvas |

## Events

**`drop:root`**

Fired when something is dropped onto the empty canvas. The payload is the current root node object. Use this to set `self` when the canvas is empty.

```js
function onDropRoot(root) {
    if (!root.self) {
        root.self = { id: crypto.randomUUID(), label: 'Root' };
    }
}
```

**`drop:node`**

Fired when something is dropped onto an existing node. The payload is `{ node, draggedId }`.

- `node` — the node that received the drop (i.e., the new parent). Mutate `node.children` to add the new child.
- `draggedId` — if the drag originated from inside the tree this is the ID of the dragged node, otherwise `null`. When it is set you should move the existing subtree rather than create a new one.

```js
function onDropNode({ node, draggedId }) {
    if (draggedId) {
        // move an existing node
        const subtree = removeFromTree(tree.value, draggedId);
        if (subtree) node.children.push(subtree);
    } else {
        // new item dragged in from outside
        node.children.push({ self: { id: crypto.randomUUID(), label: 'New' }, children: [] });
    }
}
```

## Slot: `#block`

The `#block` slot is rendered for every node in the tree. It receives the following props:

| Slot prop | Type | Description |
|---|---|---|
| `node` | Object | The `self` object of the node being rendered |
| `dragover` | Boolean | `true` when another node is being dragged over this one |
| `draggingSelf` | Boolean | `true` when this node is the one currently being dragged |

Use `draggingSelf` to visually grey out or disable a node while it is in flight, which prevents it from being dropped on itself.

## Canvas interaction

The top-level canvas responds to:

- Mouse drag — pans the canvas
- Scroll wheel — zooms in and out

Child nodes are laid out horizontally and centered under their parent. Connector arrows are drawn automatically and scale correctly with arbitrarily deep subtrees.

## Variants

The library ships two layout components. `HastyTeam` (the default export from `lib.js`) uses absolute-position panning. `HastyTeamFlow` uses the browser's native scroll on the container instead. Both expose the same props, events, and slot API.

```js
import { HastyTeam } from '@tak-ps/vue-hasty-team';
// or
import HastyTeamFlow from '@tak-ps/vue-hasty-team/components/HastyTeamFlow.vue';
```

## Example project

The `demo/` directory contains a working example built with Tabler. To run it:

```
npm install
npm run serve
```
