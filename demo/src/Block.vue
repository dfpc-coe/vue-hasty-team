<template>
    <div
        class='blockelem noselect'
        :class='{
            "blockdisabled": props.disabled,
        }'
        :draggable='props.draggable'
    >
        <div class='grabme'>
            <img src='/assets/grabme.svg'>
        </div>
        <div class='blockin'>
            <div class='blockico'>
                <span />
                <img :src='props.image'>
            </div>
            <div class='blocktext'>
                <p class='blocktitle' v-text='props.title'/>
                <p class='blockdesc' v-text='props.description'/>
            </div>
        </div>
    </div>
</template>

<script setup>
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
