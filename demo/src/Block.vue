<template>
    <div
        class='card'
        :class='{
            "cursor-move": props.draggable,
        }'
        :style='{
            "background-color": props.disabled ? "var(--tblr-gray-100)" : "var(--tblr-white)",
             "width": props.width ? props.width + "px" : "100%",
        }'
        :draggable='props.draggable'
    >
        <div class='card-header'>
            <IconGripVertical
                v-if='props.draggable'
                :size='24'
                stroke='1'
                class='me-2'
                color='gray'
            />
            <span class='card-title' v-text='props.title'/>

            <div class='ms-auto'>
                <slot name='icon'/>
            </div>
        </div>
        <div class='card-body'>
            <div>
                <p v-text='props.description'/>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    IconGripVertical
} from '@tabler/icons-vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Title'
    },
    description: {
        type: String,
        default: 'Description'
    },
    draggable: {
        type: Boolean,
        default: true
    },
    width: {
        type: Number,
    },
    disabled: {
        type: Boolean,
        default: false
    }
})
</script>
