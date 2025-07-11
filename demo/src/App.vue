<template>
    <div class='d-flex h-full'>
        <div
            class='card h-full'
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
                            @dragstart="dragStart('team')"
                            @dragend="dragEnd('team')"
                        >
                            <template #icon>
                                <IconUsers :size='24' stroke='1' />
                            </template>
                        </HastyBlock>
                    </div>
                    <div class='col-12'>
                        <HastyBlock
                            title='New User'
                            description='Known or custom individual'
                            :disabled='disabled.has("user")'
                            @dragstart="dragStart('user')"
                            @dragend="dragEnd('user')"
                        >
                            <template #icon>
                                <IconUser :size='24' stroke='1' />
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
                @drop="modifyTree"
            >
                <template #block=blockProps>
                    <HastyBlock
                        v-if='blockProps.node.type = "team"'
                        :width='300'
                        title='New Team'
                        description='Container for multipe users or equipment'
                    >
                        <template #icon>
                            <IconUsers :size='24' stroke='1' />
                        </template>
                    </HastyBlock>
                    <HastyBlock
                        v-else-if='blockProps.node.type = "user"'
                        :width='300'
                        title='New User'
                        description='Known or custom individual'
                    >
                        <template #icon>
                            <IconUsers :size='24' stroke='1' />
                        </template>
                    </HastyBlock>
                </template>
            </HastyTeam>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
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

function dragStart(id) {
    dragging.value = id;
    disabled.value.add(id)
}

function dragEnd(id) {
    dragging.value = null;
    disabled.value.delete(id);
}

function modifyTree(node) {
    if (!node.self) {
        node.self = {
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
