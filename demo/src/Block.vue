<template>
    <div
        class='card'
        :class='{
            "cursor-move": props.draggable,
        }'
        :style='{
            "background-color": props.disabled ? "var(--tblr-gray-100)" : "var(--tblr-white)",
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
                <img
                    width='32'
                    :src='props.image'
                >
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
    image: {
        type: String,
        required: true
    },
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
    disabled: {
        type: Boolean,
        default: false
    }
})
</script>
