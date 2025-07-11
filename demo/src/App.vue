<template>
    <div
        class='card'
        style='
            width: 300px;
            height: 100%;
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
            <template #blocks>
                <HastyBlock
                    image='/assets/eye.svg'
                    title='New visitor'
                    description='Triggers when somebody visits a specified page'
                />
                <HastyBlock
                    image='/assets/action.svg'
                    title='Action performed'
                    description='Triggers when somebody performs a specified action'
                />
                <HastyBlock
                    image='/assets/time.svg'
                    title='Time has passed'
                    description='Triggers after a specified amount of time'
                />
                <HastyBlock
                    image='/assets/error.svg'
                    title='Error prompt'
                    description='Triggers when a specified error happens'
                />
            </template>
        </HastyTeam>
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
    disabled.add(id)
}

function dragEnd(id) {
    dragging.value = null;
    disabled.delete(id);
}

function modifyTree(node) {
    if (!node.self) {
        node.self = {
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

.card-block:first-child {
    margin-top: 20px
}
.card-block {
    padding-top: 10px;
    width: 318px;
    border: 1px solid transparent;
    transition-property: box-shadow, height;
    transition-duration: .2s;
    transition-timing-function: cubic-bezier(.05,.03,.35,1);
    border-radius: 5px;
    box-shadow: 0px 0px 30px rgba(22, 33, 74, 0);
    box-sizing: border-box;
}
.card-block:hover {
    box-shadow: 0px 4px 30px rgba(22, 33, 74, 0.08);
    border-radius: 5px;
    background-color: #FFF;
    cursor: pointer;
}

#title {
    font-family: Roboto;
    font-weight: 500;
    font-size: 16px;
    color: #393C44;
    margin-bottom: 0px;
}

#subtitle {
    font-family: Roboto;
    color: #808292;
    font-size: 14px;
    margin-top: 5px;
}

#leftside {
    display: inline-block;
    vertical-align: middle;
    margin-left: 20px;
}


#subnav {
    border-bottom: 1px solid #E8E8EF;
    width: calc(100% + 20px);
    margin-left: -20px;
    margin-top: 10px;
}
.navdisabled {
    transition: all .3s cubic-bezier(.05,.03,.35,1);
}
.navdisabled:hover {
    cursor: pointer;
    opacity: .5;
}
.navactive {
    color: #393C44!important;
}

.navactive:after {
    display: block;
    content: "";
    width:  100%;
    height: 4px;
    background-color: #217CE8;
    margin-top: -4px;
}
#actions {
    display: inline-block;
    font-family: Roboto;
    font-weight: 500;
    color: #808292;
    font-size: 14px;
    height: 48px;
    line-height: 48px;
    width: calc(88% / 3);
    text-align: center;
    float: left;
}
#loggers {
    width: calc(88% / 3);
    display: inline-block;
    font-family: Roboto;
    font-weight: 500;
    color: #808292;
    font-size: 14px;
    height: 48px;
    line-height: 48px;
    text-align: center;
}

.grabme, .blockico {
    display: inline-block;
}
.grabme {
    margin-top: 10px;
    margin-left: 10px;
    margin-bottom: -14px;
    width: 15px;
}

#proplist {
    height: calc(100% - 305px);
    overflow: auto;
    margin-top: -30px;
    padding-top: 30px;
}
.blockin {
    display: inline-block;
    vertical-align: top;
    margin-left: 12px;
}
.blockico {
    width: 36px;
    height: 36px;
    background-color: #F1F4FC;
    border-radius: 5px;
    text-align: center;
    white-space: nowrap;
}
.blockico span {
    height: 100%;
    width: 0px;
    display: inline-block;
    vertical-align: middle;
}
.blockico img {
    vertical-align: middle;
    margin-left: auto;
    margin-right: auto;
    display: inline-block;
}
.blocktext {
    display: inline-block;
    width: 220px;
    vertical-align: top;
    margin-left: 12px
}
.blocktitle {
    margin: 0px!important;
    padding: 0px!important;
    font-family: Roboto;
    font-weight: 500;
    font-size: 16px;
    color: #393C44;
}
.blockdesc {
    margin-top: 5px;
    font-family: Roboto;
    color: #808292;
    font-size: 14px;
    line-height: 21px;
}
.blockdisabled {
    background-color: #F0F2F9;
    opacity: .5;
}
#closecard {
    position: absolute;
    margin-left: 340px;
    background-color: #FFF;
    border-radius: 0px 5px 5px 0px;
    border-bottom: 1px solid #E8E8EF;
    border-right: 1px solid #E8E8EF;
    border-top: 1px solid #E8E8EF;
    width: 53px;
    height: 53px;
    text-align: center;
    z-index: 10;
}
#closecard img {
    margin-top: 15px
}
#canvas {
    position: absolute;
    width: calc(100% - 361px);
    height: calc(100% - 71px);
    top: 71px;
    left: 361px;
    z-index: 0;
    overflow: auto;
}
#propwrap {
    position: absolute;
    right: 0;
    top: 0;
    width: 311px;
    height: 100%;
    padding-left: 20px;
    overflow: hidden;
    z-index: -2;
}
#properties {
    position: absolute;
    height: 100%;
    width: 311px;
    background-color: #FFF;
    right: -150px;
    opacity: 0;
    z-index: 2;
    top: 0px;
    box-shadow: -4px 0px 40px rgba(26, 26, 73, 0);
    padding-left: 20px;
    transition: all .25s cubic-bezier(.05,.03,.35,1);
}
.itson {
    z-index: 2!important;
}
.expanded {
    right: 0!important;
    opacity: 1!important;
    box-shadow: -4px 0px 40px rgba(26, 26, 73, 0.05);
        z-index: 2;
}

#close {
    margin-top: 100px;
    position: absolute;
    right: 20px;
    z-index: 9999;
    transition: all .25s cubic-bezier(.05,.03,.35,1);
}
#close:hover {
    cursor: pointer;
    opacity: .7;
}
#propswitch {
    border-bottom: 1px solid #E8E8EF;
    width: 331px;
    margin-top: 10px;
    margin-left: -20px;
    margin-bottom: 30px;
}
#dataprop {
    font-family: Roboto;
    font-weight: 500;
    font-size: 14px;
    text-align: center;
    color: #393C44;
    width: calc(88% / 3);
    height: 48px;
    line-height: 48px;
    display: inline-block;
    float: left;
    margin-left: 20px;
}
#dataprop:after {
    display: block;
    content: "";
    width: 100%;
    height: 4px;
    background-color: #217CE8;
    margin-top: -4px;
}
#alertprop {
    display: inline-block;
    font-family: Roboto;
    font-weight: 500;
    color: #808292;
    font-size: 14px;
    height: 48px;
    line-height: 48px;
    width: calc(88% / 3);
    text-align: center;
    float: left;
}
#logsprop {
    width: calc(88% / 3);
    display: inline-block;
    font-family: Roboto;
    font-weight: 500;
    color: #808292;
    font-size: 14px;
    height: 48px;
    line-height: 48px;
    text-align: center;
}
.inputlabel {
    font-family: Roboto;
    font-size: 14px;
    color: #253134;
}
.dropme {
    background-color: #FFF;
    border-radius: 5px;
    border: 1px solid #E8E8EF;
    box-shadow: 0px 2px 8px rgba(34, 34, 87, 0.05);
    font-family: Roboto;
    font-size: 14px;
    color: #253134;
    text-indent: 20px;
    height: 40px;
    line-height: 40px;
    width: 287px;
    margin-bottom: 25px;
}
.dropme img {
    margin-top: 17px;
    float: right;
    margin-right: 15px;
}
.checkus {
    margin-bottom: 10px;
}
.checkus img {
    display: inline-block;
    vertical-align: middle;
}
.checkus p {
    display: inline-block;
    font-family: Roboto;
    font-size: 14px;
    vertical-align: middle;
    margin-left: 10px;
}
#divisionthing {
    height: 1px;
    width: 100%;
    background-color: #E8E8EF;
    position: absolute;
    right: 0px;
    bottom: 80;
}
#removeblock {
    border-radius: 5px;
    position: absolute;
    bottom: 20px;
    font-family: Roboto;
    font-size: 14px;
    text-align: center;
    width: 287px;
    height: 38px;
    line-height: 38px;
    color: #253134;
    border: 1px solid #E8E8EF;
    transition: all .3s cubic-bezier(.05,.03,.35,1);
}
#removeblock:hover {
    cursor: pointer;
    opacity: .5;
}
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Opera and Firefox */
}
.blockyname {
    font-family: Roboto;
    font-weight: 500;
    color: #253134;
    display: inline-block;
    vertical-align: middle;
    margin-left: 8px;
    font-size: 16px;
}
.blockyleft img {
    display: inline-block;
    vertical-align: middle;
}
.blockyright {
    display: inline-block;
    float: right;
    vertical-align: middle;
    margin-right: 20px;
    margin-top: 10px;
    width: 28px;
    height: 28px;
    border-radius: 5px;
    text-align: center;
    background-color: #FFF;
    transition: all .3s cubic-bezier(.05,.03,.35,1);
    z-index: 10;
}
.blockyright:hover {
    background-color: #F1F4FC;
    cursor: pointer;
}
.blockyright img {
    margin-top: 12px;
}
.blockyleft {
    display: inline-block;
    margin-left: 20px;
}
.blockydiv {
    width: 100%;
    height: 1px;
    background-color: #E9E9EF;
}
.blockyinfo {
    font-family: Roboto;
    font-size: 14px;
    color: #808292;
    margin-top: 15px;
    text-indent: 20px;
    margin-bottom: 20px;
}
.blockyinfo span {
    color: #253134;
    font-weight: 500;
    display: inline-block;
    border-bottom: 1px solid #D3DCEA;
    line-height: 20px;
    text-indent: 0px;
}
.block {
    background-color: #FFF;
    margin-top: 0px!important;
    box-shadow: 0px 4px 30px rgba(22, 33, 74, 0.05);
}
.selectedblock {
    border: 2px solid #217CE8;
    box-shadow: 0px 4px 30px rgba(22, 33, 74, 0.08);
}
</style>
