<template>
    <!-- Root canvas wrapper (only at the top level) -->
    <div
        v-if='!props.nested'
        ref='wheelContainer'
        class='h-100 w-100 position-relative d-flex justify-content-center overflow-hidden'
        :style='{
            minWidth: "0",
            cursor: isPanning ? "grabbing" : "grab",
            userSelect: isPanning ? "none" : "auto"
        }'
        @mousedown='startPan'
    >
        <div
            ref='container'
            class='px-4 py-4'
            :class='{ "border border-blue": dragging }'
            style='
                height: 100%;
                width: max-content;
                min-width: 100%;
            '
            :style='{ "transform": `translate(${panX}px, ${panY}px) scale(${zoom})` }'
            @dragover.prevent='dragOverContainer'
            @drop.prevent='droppedRoot'
        >
            <div class='d-flex align-items-center justify-content-center'>
                <div
                    v-if='normalizedSelf'
                    @mousedown.stop
                    @dragenter.prevent.stop='over.add(normalizedSelf.id)'
                    @dragover.prevent.stop='over.add(normalizedSelf.id)'
                    @dragexit.prevent.stop='over.delete(normalizedSelf.id)'
                    @drop.prevent.stop='droppedNode(normalizedSelf.id)'
                >
                    <slot
                        name='block'
                        :node='normalizedSelf'
                        :dragover='dragging !== normalizedSelf.id && over.has(normalizedSelf.id)'
                        :dragging-self='dragging === normalizedSelf.id'
                    />
                </div>
            </div>

            <!-- Arrow connections between parent and children -->
            <div
                v-if='normalizedSelf && normalizedChildren.length > 0'
                class='d-flex align-items-center justify-content-center position-relative'
                style='height: 60px; margin: 20px 0;'
            >
                <svg
                    :width='containerWidth'
                    :height='60'
                    class='position-absolute'
                    style='top: 0; left: 50%; transform: translateX(-50%);'
                >
                    <!-- Vertical line from parent -->
                    <line
                        :x1='containerWidth / 2'
                        y1='0'
                        :x2='containerWidth / 2'
                        y2='30'
                        stroke='#6c757d'
                        stroke-width='2'
                    />

                    <!-- Horizontal line connecting to all children -->
                    <line
                        v-if='normalizedChildren.length > 1'
                        :x1='childrenStartX'
                        y1='30'
                        :x2='childrenEndX'
                        y2='30'
                        stroke='#6c757d'
                        stroke-width='2'
                    />

                    <!-- Vertical lines to each child -->
                    <line
                        v-for='(child, index) in normalizedChildren'
                        :key='child.self.id'
                        :x1='getChildLineX(index)'
                        y1='30'
                        :x2='getChildLineX(index)'
                        y2='60'
                        stroke='#6c757d'
                        stroke-width='2'
                    />

                    <!-- Arrow heads pointing to children -->
                    <polygon
                        v-for='(child, index) in normalizedChildren'
                        :key='child.self.id + "-arrow"'
                        :points='getArrowPoints(index)'
                        fill='#6c757d'
                    />
                </svg>
            </div>

            <div
                class='d-flex align-items-start justify-content-center'
                :style='{ width: `${containerWidth}px` }'
            >
                <HastyTeam
                    v-for='child in normalizedChildren'
                    :id='child.self.id'
                    :key='child.self.id'
                    class='mx-3'
                    :model-value='child'
                    nested
                    @dragstart='dragging = child.self.id'
                    @dragend='dragging = false'
                    @dragenter.prevent.stop='over.add(child.self.id)'
                    @dragover.prevent.stop='over.add(child.self.id)'
                    @dragexit.prevent.stop='over.delete(child.self.id)'
                    @drop.prevent.stop='droppedNode(child.self.id)'
                    @drop:root='forwardDropRoot'
                    @drop:node='forwardDropNode'
                >
                    <template #block='blockProps'>
                        <slot
                            name='block'
                            :node='blockProps.node'
                            :dragover='blockProps.dragover'
                            :dragging-self='blockProps.draggingSelf'
                        />
                    </template>
                </HastyTeam>
            </div>
        </div>

        <div
            v-if='props.debug'
            class='position-absolute bottom-0 start-0 end-0 mx-3'
        >
            <pre v-text='JSON.stringify(props.modelValue)' />
        </div>
    </div>

    <!-- Nested child wrapper — natural sizing, no scroll/zoom/pan -->
    <div
        v-else
        :class='{ "border border-blue": dragging }'
        @mousedown.stop
        @dragover.prevent='dragOverContainer'
        @drop.prevent='droppedRoot'
    >
        <div class='d-flex align-items-center justify-content-center'>
            <div
                v-if='normalizedSelf'
                @mousedown.stop
                @dragenter.prevent.stop='over.add(normalizedSelf.id)'
                @dragover.prevent.stop='over.add(normalizedSelf.id)'
                @dragexit.prevent.stop='over.delete(normalizedSelf.id)'
                @drop.prevent.stop='droppedNode(normalizedSelf.id)'
            >
                <slot
                    name='block'
                    :node='normalizedSelf'
                    :dragover='dragging !== normalizedSelf.id && over.has(normalizedSelf.id)'
                    :dragging-self='dragging === normalizedSelf.id'
                />
            </div>
        </div>

        <!-- Arrow connections between parent and children -->
        <div
            v-if='normalizedSelf && normalizedChildren.length > 0'
            class='d-flex align-items-center justify-content-center position-relative'
            style='height: 60px; margin: 20px 0;'
        >
            <svg
                :width='containerWidth'
                :height='60'
                class='position-absolute'
                style='top: 0; left: 50%; transform: translateX(-50%);'
            >
                <line
                    :x1='containerWidth / 2'
                    y1='0'
                    :x2='containerWidth / 2'
                    y2='30'
                    stroke='#6c757d'
                    stroke-width='2'
                />
                <line
                    v-if='normalizedChildren.length > 1'
                    :x1='childrenStartX'
                    y1='30'
                    :x2='childrenEndX'
                    y2='30'
                    stroke='#6c757d'
                    stroke-width='2'
                />
                <line
                    v-for='(child, index) in normalizedChildren'
                    :key='child.self.id'
                    :x1='getChildLineX(index)'
                    y1='30'
                    :x2='getChildLineX(index)'
                    y2='60'
                    stroke='#6c757d'
                    stroke-width='2'
                />
                <polygon
                    v-for='(child, index) in normalizedChildren'
                    :key='child.self.id + "-arrow"'
                    :points='getArrowPoints(index)'
                    fill='#6c757d'
                />
            </svg>
        </div>

        <div
            class='d-flex align-items-start justify-content-center'
            :style='{ width: `${containerWidth}px` }'
        >
            <HastyTeam
                v-for='child in normalizedChildren'
                :id='child.self.id'
                :key='child.self.id'
                class='mx-3'
                :model-value='child'
                nested
                @dragstart='dragging = child.self.id'
                @dragend='dragging = false'
                @dragenter.prevent.stop='over.add(child.self.id)'
                @dragover.prevent.stop='over.add(child.self.id)'
                @dragexit.prevent.stop='over.delete(child.self.id)'
                @drop.prevent.stop='droppedNode(child.self.id)'
                @drop:root='forwardDropRoot'
                @drop:node='forwardDropNode'
            >
                <template #block='blockProps'>
                    <slot
                        name='block'
                        :node='blockProps.node'
                        :dragover='blockProps.dragover'
                        :dragging-self='blockProps.draggingSelf'
                    />
                </template>
            </HastyTeam>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';

defineOptions({
    name: 'HastyTeam'
});

const zoom = ref(1);
const dragging = ref(false);
const isPanning = ref(false);
const panStartX = ref(0);
const panStartY = ref(0);
const panX = ref(0);
const panY = ref(0);
const panOffsetX = ref(0);
const panOffsetY = ref(0);

const wheelContainerRef = useTemplateRef('wheelContainer');
const containerRef = useTemplateRef('container');

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    },
    debug: {
        type: Boolean,
        default: false
    },
    nested: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'update:modelValue',
    'drop:root',
    'drop:node'
]);

const over = ref(new Set());
const childWidth = 300;
const childMarginX = 16;
const childOuterWidth = childWidth + childMarginX * 2;
const normalizedSelf = computed(() => props.modelValue?.self ?? null);
const normalizedChildren = computed(() => Array.isArray(props.modelValue?.children) ? props.modelValue.children : []);

watch(
    () => props.modelValue,
    (value) => {
        if (hasValidModelShape(value)) return;

        emit('update:modelValue', normalizeModel(value));
    },
    {
        immediate: true
    }
);

// Computed properties for arrow positioning
const containerWidth = computed(() => {
    if (!normalizedChildren.value.length) return 400;

    return normalizedChildren.value.length * childOuterWidth;
});

const childrenStartX = computed<number>(() => {
    if (normalizedChildren.value.length <= 1) return containerWidth.value / 2;

    return childMarginX + childWidth / 2;
});

const childrenEndX = computed<number>(() => {
    if (normalizedChildren.value.length <= 1) return containerWidth.value / 2;

    return getChildLineX(normalizedChildren.value.length - 1);
});

// Methods for arrow positioning
function getChildLineX(index) {
    return childMarginX + childWidth / 2 + index * childOuterWidth;
}

function getArrowPoints(index) {
    const x = getChildLineX(index);
    const y = 60;
    // Create a small downward-pointing triangle
    return `${x-4},${y-8} ${x+4},${y-8} ${x},${y}`;
}

onMounted(() => {
    if (props.nested) return;

    if (!containerRef.value) throw new Error('Container element not found');
    if (!wheelContainerRef.value) throw new Error('WheelContainer element not found');

    wheelContainerRef.value.addEventListener('wheel', wheel);
});

onBeforeUnmount(() => {
    if (props.nested) return;

    if (wheelContainerRef.value) {
        wheelContainerRef.value.removeEventListener('wheel', wheel);
    }

    window.removeEventListener('mousemove', pan);
    window.removeEventListener('mouseup', endPan);
    window.removeEventListener('mouseleave', endPan);
});

function dragOverContainer() {
    // Container receives drag over events
}

function startPan(event: MouseEvent) {
    if (event.button !== 0) return;

    isPanning.value = true;
    panStartX.value = event.clientX;
    panStartY.value = event.clientY;
    panOffsetX.value = panX.value;
    panOffsetY.value = panY.value;

    window.addEventListener('mousemove', pan);
    window.addEventListener('mouseup', endPan);
    window.addEventListener('mouseleave', endPan);
}

function pan(event: MouseEvent) {
    if (!isPanning.value) return;

    const deltaX = event.clientX - panStartX.value;
    const deltaY = event.clientY - panStartY.value;

    panX.value = panOffsetX.value + deltaX;
    panY.value = panOffsetY.value + deltaY;
}

function endPan() {
    if (!isPanning.value) return;

    isPanning.value = false;
    window.removeEventListener('mousemove', pan);
    window.removeEventListener('mouseup', endPan);
    window.removeEventListener('mouseleave', endPan);
}

function wheel(event) {
    zoom.value += event.wheelDelta * 0.001
}

/**
 * Fired if something is dropped on a specific node
 *
 * @param id The ID of the node that received the drop
 */
function droppedNode(id: string) {
    over.value.delete(id);

    const dragged = dragging.value;

    dragging.value = false;

    // Ignore drops on the node being dragged
    if (dragged === id) return;

    const node = searchTreeById(getModelRoot(), id);

    if (!node) {
        console.warn(`Node with id ${id} not found in the modelValue`);
        return;
    }

    if (node.children.some(child => child.self.id === dragged)) {
        // If the node is already a child, we don't need to do anything
        return;
    } else {
        emit('drop:node', node);
    }
}

/**
 * Fired if something is dropped on the container but not a specific node
 */
function droppedRoot() {
    // Only handle the drop if there's no child block
    // If there's a child block, its event handlers with .stop should prevent this from firing
    if (!normalizedSelf.value) {
        dragging.value = false;
        emit('drop:root', getModelRoot());
    }
}

function forwardDropRoot(node) {
    emit('drop:root', node);
}

function forwardDropNode(node) {
    emit('drop:node', node);
}

function searchTreeById(node, id) {
    if (!node || !node.self) return null;
    if (node.self.id === id) return node;

    for (const child of node.children || [] ) {
        const result = searchTreeById(child, id);
        if (result) return result;
    }

    return null;
}

function hasValidModelShape(value) {
    return Boolean(value) && typeof value === 'object' && 'self' in value && Array.isArray(value.children);
}

function getModelRoot() {
    return hasValidModelShape(props.modelValue)
        ? props.modelValue
        : normalizeModel(props.modelValue);
}

function normalizeModel(value) {
    return {
        self: value?.self ?? null,
        children: Array.isArray(value?.children) ? value.children : [],
    };
}
</script>
