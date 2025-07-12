<template>
    <div
        ref='wheelContainer'
        class='h-100 w-100 position-relative d-flex justify-content-center'
    >
        <div
            ref='container'
            class='px-4 py-4'
            :class='{
                "border border-blue": dragging
            }'
            style='
                height: 100%;
                width: 100%;
            '
            :style='{
                "transform": `scale(${zoom})`,
            }'

            @dragover.prevent='dragOverContainer'
            @drop.prevent='droppedRoot'
            @dragenter.prevent='dragEnterContainer'
            @dragexit.prevent='dragExitContainer'
        >
            <div class='d-flex align-items-center justify-content-center'>
                <div
                    v-if='modelValue.self'
                    @dragenter.prevent.stop='over.add(modelValue.self.id)'
                    @dragover.prevent.stop='over.add(modelValue.self.id)'
                    @dragexit.prevent.stop='over.delete(modelValue.self.id)'
                    @drop.prevent.stop='droppedNode(modelValue.self.id)'
                >
                    <slot
                        name='block'
                        :node='modelValue.self'
                        :dragover='over.has(modelValue.self.id)'
                    />
                </div>
            </div>

            <!-- Arrow connections between parent and children -->
            <div
                v-if='modelValue.self && modelValue.children.length > 0'
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
                        v-if='modelValue.children.length > 1'
                        :x1='childrenStartX'
                        y1='30'
                        :x2='childrenEndX'
                        y2='30'
                        stroke='#6c757d'
                        stroke-width='2'
                    />

                    <!-- Vertical lines to each child -->
                    <line
                        v-for='(child, index) in modelValue.children'
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
                        v-for='(child, index) in modelValue.children'
                        :key='child.self.id + "-arrow"'
                        :points='getArrowPoints(index)'
                        fill='#6c757d'
                    />
                </svg>
            </div>

            <div class='d-flex align-items-center justify-content-center'>
                <div
                    v-for='child in modelValue.children'
                    :key='child.self.id'
                    class='mx-3'
                    @dragenter.prevent.stop='over.add(child.self.id)'
                    @dragover.prevent.stop='over.add(child.self.id)'
                    @dragexit.prevent.stop='over.delete(child.self.id)'
                    @drop.prevent.stop='droppedNode(child.self.id)'
                >
                    <slot
                        name='block'
                        :node='child.self'
                        :dragover='over.has(child.self.id)'
                    />
                </div>
            </div>
        </div>

        <div
            v-if='props.debug'
            class='position-absolute bottom-0 start-0 end-0 mx-3'
        >
            <pre v-text='JSON.stringify(props.modelValue)' />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, useTemplateRef, computed } from 'vue';

const zoom = ref(1);
const dragging = ref(false);

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
    }
});

const emit = defineEmits([
    'update:modelValue',
    'drop:root',
    'drop:node'
]);

const over = ref(new Set());

// Computed properties for arrow positioning
const containerWidth = computed(() => {
    if (!props.modelValue.children.length) return 400;
    // Calculate width based on number of children and spacing
    const childWidth = 300; // Assuming each block is 300px wide
    const spacing = 24; // 12px margin on each side
    return props.modelValue.children.length * (childWidth + spacing) + spacing;
});

const childrenStartX = computed(() => {
    if (props.modelValue.children.length <= 1) return containerWidth.value / 2;
    const childWidth = 300;
    const spacing = 24;
    const totalChildrenWidth = props.modelValue.children.length * childWidth + (props.modelValue.children.length - 1) * spacing;
    const startOffset = (containerWidth.value - totalChildrenWidth) / 2;
    return startOffset + childWidth / 2;
});

const childrenEndX = computed(() => {
    if (props.modelValue.children.length <= 1) return containerWidth.value / 2;
    const childWidth = 300;
    const spacing = 24;
    const totalChildrenWidth = props.modelValue.children.length * childWidth + (props.modelValue.children.length - 1) * spacing;
    const startOffset = (containerWidth.value - totalChildrenWidth) / 2;
    return startOffset + totalChildrenWidth - childWidth / 2;
});

// Methods for arrow positioning
function getChildLineX(index) {
    const childWidth = 300;
    const spacing = 24;
    const totalChildrenWidth = props.modelValue.children.length * childWidth + (props.modelValue.children.length - 1) * spacing;
    const startOffset = (containerWidth.value - totalChildrenWidth) / 2;
    return startOffset + index * (childWidth + spacing) + childWidth / 2;
}

function getArrowPoints(index) {
    const x = getChildLineX(index);
    const y = 60;
    // Create a small downward-pointing triangle
    return `${x-4},${y-8} ${x+4},${y-8} ${x},${y}`;
}

onMounted(() => {
    if (!containerRef.value) throw new Error('Container element not found');
    if (!containerRef.value) throw new Error('WheelContainer element not found');

    wheelContainerRef.value.addEventListener('wheel', wheel);

    if (!props.modelValue.self && !props.modelValue.children) {
        emit('update:modelValue', {
            self: null,
            children: [],
        });
    }
});

function dragOverContainer() {
    // Container receives drag over events
}

function dragEnterContainer() {
    dragging.value = true;
}

function dragExitContainer() {
    dragging.value = false;
}

function wheel(event) {
    zoom.value += event.wheelDelta * 0.001
}

/**
 * Fired if something is dropped on a specific node
 */
function droppedNode(id) {
    over.value.delete(id);
    dragging.value = false;

    const node = searchTreeById(props.modelValue, id);

    if (!node) {
        console.warn(`Node with id ${id} not found in the modelValue`);
        return;
    }

    if (node.children.some(child => child.self.id === id)) {
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
    if (!props.modelValue.self) {
        dragging.value = false;
        emit('drop:root', props.modelValue);
    }
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
</script>
