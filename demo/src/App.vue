<template>
    <div class='d-flex h-full'>
        <div
            class='card h-full z-1'
            style='
                width: 300px;
             '
        >
            <div class='container'>
                <div class='row g-2 mt-2 align-items-center'>
                    <div class='col-12'>
                        <HastyBlock
                            title='New Team'
                            description='Container for multipe users or equipment'
                            :disabled='disabled.has("team")'
                            @dragstart='(event) => handleDragStart(event, &apos;team&apos;)'
                            @dragend='(event) => handleDragEnd(event, &apos;team&apos;)'
                        >
                            <template #icon>
                                <IconUsers
                                    :size='24'
                                    stroke='1'
                                />
                            </template>
                        </HastyBlock>
                    </div>
                    <div class='col-12'>
                        <HastyBlock
                            title='New User'
                            description='Known or custom individual'
                            :disabled='disabled.has("user")'
                            @dragstart='(event) => handleDragStart(event, &apos;user&apos;)'
                            @dragend='(event) => handleDragEnd(event, &apos;user&apos;)'
                        >
                            <template #icon>
                                <IconUser
                                    :size='24'
                                    stroke='1'
                                />
                            </template>
                        </HastyBlock>
                    </div>
                </div>
            </div>
        </div>

        <div
            style='
                width: calc(100% - 300px);
                height: 100%;
            '
        >
            <HastyTeam
                v-model='tree'
                :debug='true'
                @drop:root='modifyTreeRoot($event)'
                @drop:node='modifyTreeNode($event)'
            >
                <template #block='blockProps'>
                    <HastyBlock
                        v-if='blockProps.node.type === "team"'
                        :width='300'
                        :dragover='blockProps.dragover'
                        title='New Team'
                        description='Container for multipe users or equipment'
                    >
                        <template #icon>
                            <IconUsers
                                :size='24'
                                stroke='1'
                            />
                        </template>
                    </HastyBlock>
                    <HastyBlock
                        v-else-if='blockProps.node.type === "user"'
                        :width='300'
                        title='New User'
                        :dragover='blockProps.dragover'
                        description='Known or custom individual'
                    >
                        <template #icon>
                            <IconUser
                                :size='24'
                                stroke='1'
                            />
                        </template>
                    </HastyBlock>
                </template>
            </HastyTeam>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import '@tabler/core/dist/js/tabler.min.js';
import '@tabler/core/dist/css/tabler.min.css';
import HastyBlock from './Block.vue';
import { HastyTeam } from '../../lib.js'
import {
    IconUser,
    IconUsers
} from '@tabler/icons-vue';

const dragging = ref(null);
const disabled = ref(new Set());
const tree = ref({});

function handleDragStart(event, id) {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
    dragging.value = id;
    disabled.value.add(id);
}

function handleDragEnd(event, id) {
    dragging.value = null;
    disabled.value.delete(id);
}

function modifyTreeNode(node) {
    node.children.push({
        self: {
            id: crypto.randomUUID(),
            type: dragging.value
        },
        children: []
    });
}


function modifyTreeRoot(root) {
    if (!root.self) {
        root.self = {
            id: crypto.randomUUID(),
            type: dragging.value
        }
    }
}

</script>

<style>
body, html, #app {
    margin: 0px;
    padding: 0px;
    overflow: hidden;
    background-image: url(/assets/tile.png);
    background-repeat: repeat;
    background-size: 30px 30px;
    background-color: #FBFBFB;
    height: 100%;
}
</style>
