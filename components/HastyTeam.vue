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

            @dragover.prevent
            @drop.self.prevent='droppedRoot'
            @dragenter.self.prevent='dragging = true'
            @dragexit.self.prevent='dragging = false'
        >
            <div class='d-flex align-items-center justify-content-center'>
                <slot
                    v-if='modelValue.self'
                    name='block'
                    @dragenter.precent.stop='over.add(modelValue.self.id)'
                    @dragover.prevent.stop='over.add(modelValue.self.id)'
                    @dragexit.prevent.stop='over.delete(modelValue.self.id)'
                    @drop.prevent.stop='droppedNode'
                    :node='modelValue.self'
                    :dragover='over.has(modelValue.self.id)'
                />
            </div>
        </div>

        <div
            v-if='props.debug'
            class='position-absolute bottom-0 start-0 end-0 mx-3'
        >
            <pre v-text='over'/>
            <pre v-text='JSON.stringify(props.modelValue)'/>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, h, useTemplateRef } from 'vue';

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

const emit = defineEmits(['update:modelValue', 'drop']);

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

function log() {
    console.error('I WAS FIRED');
}

function wheel(event) {
    console.error('Wheeled', event);
    zoom.value += event.wheelDelta * 0.001
}

/**
 * Fired if something is dropped on a specific node
 */
function droppedNode(event) {
    dragging.value = false;
    console.error('droppedNode');
}

/**
 * Fired if something is dropped on the container but not a specific node
 */
function droppedRoot(event) {
console.error('ROOT');
    dragging.value = false;
    if (!props.modelValue.self) {
        emit('drop', props.modelValue);
    }
}
</script>
