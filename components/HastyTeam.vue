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
                transform-origin: 0% 0%;
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
            <div class='d-flex align-items-center justify-content-center'>
                <div
                    v-for='child in modelValue.children'
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
            <pre v-text='over' />
            <pre v-text='JSON.stringify(props.modelValue)' />
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, useTemplateRef } from 'vue';

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
    console.error('Wheeled', event);
    zoom.value += event.wheelDelta * 0.001
}

/**
 * Fired if something is dropped on a specific node
 */
function droppedNode(id) {
    over.value.delete(id);
    dragging.value = false;
    emit('drop:node', props.modelValue);
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

// Removed unused function
</script>
