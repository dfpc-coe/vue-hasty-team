<template>
    <div
        class='card'
        :class='{
            "cursor-move": props.draggable && !editing,
            "border border-blue": props.dragover && !props.disabled,
        }'
        :style='{
            "background-color": props.disabled ? "var(--tblr-gray-100)" : "var(--tblr-white)",
            "width": props.width ? props.width + "px" : "100%",
        }'
        :draggable='props.draggable && !editing'
        @keydown.escape='cancel'
    >
        <div class='card-header'>
            <IconGripVertical
                v-if='props.draggable && !editing'
                :size='24'
                stroke='1'
                class='me-2'
                color='gray'
            />

            <slot name='icon' />

            <span
                v-if='!editing'
                class='card-title ms-1'
                v-text='props.title'
            />
            <TablerInput
                v-else
                v-model='editTitle'
                placeholder='Title'
                class='me-2'
                @submit='save'
            />

            <div class='ms-auto d-flex align-items-center gap-1'>

                <template v-if='props.node'>
                    <TablerIconButton
                        v-if='!editing'
                        title='Edit'
                        @click.stop='startEdit'
                    >
                        <IconPencil
                            :size='16'
                            stroke='1'
                        />
                    </TablerIconButton>
                    <TablerIconButton
                        v-else
                        title='Save'
                        @click.stop='save'
                    >
                        <IconCheck
                            :size='16'
                            stroke='1'
                        />
                    </TablerIconButton>
                    <TablerDelete
                        v-if='!editing'
                        displaytype='icon'
                        :size='16'
                        @delete='emit("delete:node", props.node)'
                    />
                </template>
            </div>
        </div>
        <div class='card-body'>
            <div>
                <p
                    v-if='!editing'
                    v-text='props.description'
                />
                <TablerInput
                    v-else
                    v-model='editDescription'
                    placeholder='Description'
                    @submit='save'
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import {
    IconGripVertical,
    IconPencil,
    IconCheck
} from '@tabler/icons-vue';
import { TablerIconButton, TablerInput, TablerDelete } from '@tak-ps/vue-tabler';

const props = defineProps({
    node: {
        type: Object,
        default: null
    },
    title: {
        type: String,
        default: 'Title'
    },
    description: {
        type: String,
        default: 'Description'
    },
    dragover: {
        type: Boolean,
        default: false
    },
    draggable: {
        type: Boolean,
        default: true
    },
    width: {
        type: Number,
        default: null
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:node', 'delete:node']);

const editing = ref(false);
const editTitle = ref('');
const editDescription = ref('');

function startEdit() {
    editTitle.value = props.title;
    editDescription.value = props.description;
    editing.value = true;
}

function save() {
    emit('update:node', {
        ...props.node,
        title: editTitle.value,
        description: editDescription.value
    });
    editing.value = false;
}

function cancel() {
    editing.value = false;
}
</script>
