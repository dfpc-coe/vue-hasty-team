<template>
    <div id='leftcard'>
        <div id='blocklist'>
            <HastyBlock
                image='/assets/eye.svg'
                title='New visitor'
                description='Triggers when somebody visits a specified page'
                :disabled='disabled.has("new-visitor")'
                @dragstart="onDragStart"
                @drag="onDrag"
                @dragend="onDragEnd"
            />
            <HastyBlock
                image='/assets/action.svg'
                title='Action performed'
                description='Triggers when somebody performs a specified action'
                :disabled='disabled.has("action-performed")'
                @dragstart="onDragStart"
                @drag="onDrag"
                @dragend="onDragEnd"
            />
            <HastyBlock
                image='/assets/time.svg'
                title='Time has passed'
                description='Triggers after a specified amount of time'
                :disabled='disabled.has("time-passed")'
                @dragstart="onDragStart"
                @drag="onDrag"
                @dragend="onDragEnd"
            />
            <HastyBlock
                image='/assets/error.svg'
                title='Error prompt'
                description='Triggers when a specified error happens'
                :disabled='disabled.has("error-prompt")'
                @dragstart="onDragStart"
                @drag="onDrag"
                @dragend="onDragEnd"
            />
        </div>
    </div>
    <div id='propwrap'>
        <div id='properties'>
            <div id='close'>
                <img src='/assets/close.svg'>
            </div>
            <p id='header2'>
                Properties
            </p>
            <div id='propswitch'>
                <div id='dataprop'>
                    Data
                </div>
                <div id='alertprop'>
                    Alerts
                </div>
                <div id='logsprop'>
                    Logs
                </div>
            </div>
            <div id='proplist'>
                <p class='inputlabel'>
                    Select database
                </p>
                <div class='dropme'>
                    Database 1 <img src='/assets/dropdown.svg'>
                </div>
                <p class='inputlabel'>
                    Check properties
                </p>
                <div class='dropme'>
                    All<img src='/assets/dropdown.svg'>
                </div>
                <div class='checkus'>
                    <img src='/assets/checkon.svg'><p>Log on successful performance</p>
                </div>
                <div class='checkus'>
                    <img src='/assets/checkoff.svg'><p>Give priority to this block</p>
                </div>
            </div>

            <div
                id='removeblock'
                @click='deleteBlocks'
            >
                Delete blocks
            </div>
        </div>
    </div>

    <HastyTeam
        v-model='tree'
    />
</template>

<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import HastyBlock from './Block.vue';
import { HastyTeam } from '../../lib.js'

const disabled = ref(new Set());
const tree = ref({});

</script>
