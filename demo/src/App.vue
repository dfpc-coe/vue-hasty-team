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
                            image='/assets/eye.svg'
                            title='New visitor'
                            description='Triggers when somebody visits a specified page'
                            :disabled='disabled.has("new-visitor")'
                            @dragstart="dragStart('new-visitor')"
                            @dragend="dragEnd('new-visitor')"
                        />
                    </div>
                    <div class='col-12'>
                        <HastyBlock
                            image='/assets/action.svg'
                            title='Action performed'
                            description='Triggers when somebody performs a specified action'
                            :disabled='disabled.has("action-performed")'
                            @dragstart="dragStart('action-performed')"
                            @dragend="dragEnd('action-performed')"
                        />
                    </div>
                    <div class='col-12'>
                        <HastyBlock
                            image='/assets/time.svg'
                            title='Time has passed'
                            description='Triggers after a specified amount of time'
                            :disabled='disabled.has("time-passed")'
                            @dragstart="dragStart('time-passed')"
                            @dragend="dragEnd('time-passed')"
                        />
                    </div>
                    <div class='col-12'>
                        <HastyBlock
                            image='/assets/error.svg'
                            title='Error prompt'
                            description='Triggers when a specified error happens'
                            :disabled='disabled.has("error-prompt")'
                            @dragstart="dragStart('error-prompt')"
                            @dragend="dragEnd('error-prompt')"
                        />
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
                @drop="modifyTree"
            >
                <template #block=blockProps>
                    <HastyBlock
                        v-if='blockProps.node.type = "new-visitor"'
                        image='/assets/eye.svg'
                        title='New visitor'
                        :width='300'
                        description='Triggers when somebody visits a specified page'
                    />
                    <HastyBlock
                        v-else-if='blockProps.node.type = "action-performed"'
                        image='/assets/action.svg'
                        title='Action performed'
                        :width='300'
                        description='Triggers when somebody performs a specified action'
                    />
                    <HastyBlock
                        v-else-if='blockProps.node.type = "time-passed"'
                        image='/assets/time.svg'
                        title='Time has passed'
                        :width='300'
                        description='Triggers after a specified amount of time'
                    />
                    <HastyBlock
                        v-else-if='blockProps.node.type = "error-prompt"'
                        image='/assets/error.svg'
                        title='Error prompt'
                        description='Triggers when a specified error happens'
                    />
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
