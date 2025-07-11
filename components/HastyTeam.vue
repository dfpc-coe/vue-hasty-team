<template>
    <div
        ref='container'
        style='
            height: 100%;
            width: 100%;
        '
        @drop.prevent='dropped'
        @dragover.prevent='dragover'
        @dragenter.prevent='dragging = true'
        @dragexit.prevent='dragging = false'
    >
        <span v-text='props.modelValue'/>

        <slot
            v-if='modelValue.self'
            name='block'
            :node='modelValue.self'
        />
    </div>
</template>

<script setup>
import { onMounted, ref, h, useTemplateRef } from 'vue';

const dragging = ref(false);
const containerRef = useTemplateRef('container');

const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    },
    spacing_x: {
        type: Number,
        default: 20
    },
    spacing_y: {
        type: Number,
        default: 80
    }
});

const emit = defineEmits(['update:modelValue', 'drop']);

const loaded = ref(false);
const active = ref(false);

onMounted(() => {
    if (!containerRef.value) throw new Error('Canvas element not found');
    if (!loaded.value) loaded.value = true;

    if (!props.modelValue.self && !props.modelValue.children) {
        emit('update:modelValue', {
            self: null,
            children: [],
        });
    }
});

function dropped(event) {
    if (!props.modelValue.self) {
        emit('drop', props.modelValue);
    }
}

function dragover(event) {

}
</script>

<style scoped>

.block{
    position:absolute;
    z-index:9
}
.indicator{
    width:12px;
    height:12px;
    border-radius:60px;
    background-color:#217ce8;
    margin-top:-5px;
    opacity:1;
    transition:all .3s cubic-bezier(.05,.03,.35,1);
    transform:scale(1);
    position:absolute;
    z-index:2
}
.invisible{
    opacity:0!important;
    transform:scale(0)
}
.indicator:after{
    content:"";
    display:block;
    width:12px;
    height:12px;
    background-color:#217ce8;
    transform:scale(1.7);
    opacity:.2;
    border-radius:60px
}
.arrowblock{
    position:absolute;
    width:100%;
    overflow:visible;
    pointer-events:none
}
.arrowblock svg{
    width: -webkit-fill-available;
    overflow: visible;
}
</style>
