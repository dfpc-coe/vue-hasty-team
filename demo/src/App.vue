<template>
    <div class='d-flex h-full w-100 overflow-hidden'>
        <div
            class='card h-full z-1'
            style='
                width: 300px;
                flex: 0 0 300px;
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
                flex: 1 1 auto;
                min-width: 0;
                height: 100%;
                overflow: auto;
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
                        :node='blockProps.node'
                        :width='300'
                        :dragover='blockProps.dragover'
                        :disabled='blockProps.draggingSelf'
                        :title='blockProps.node.title || "New Team"'
                        :description='blockProps.node.description || "Container for multiple users or equipment"'
                        @update:node='updateNodeInTree($event)'
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
                        :node='blockProps.node'
                        :width='300'
                        :dragover='blockProps.dragover'
                        :disabled='blockProps.draggingSelf'
                        :title='blockProps.node.title || "New User"'
                        :description='blockProps.node.description || "Known or custom individual"'
                        @update:node='updateNodeInTree($event)'
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

function modifyTreeNode({ node, draggedId }) {
    if (draggedId) {
        // Move an existing tree node: detach it from wherever it currently lives
        // then attach it as a child of the target node.
        const subtree = extractNodeById(tree.value, draggedId);
        if (subtree) node.children.push(subtree);
    } else {
        // Sidebar drop: create a brand-new child node.
        node.children.push({
            self: {
                id: crypto.randomUUID(),
                type: dragging.value,
                title: dragging.value === 'team' ? 'New Team' : 'New User',
                description: dragging.value === 'team' ? 'Container for multiple users or equipment' : 'Known or custom individual'
            },
            children: []
        });
    }
}


function modifyTreeRoot(root) {
    if (!root.self) {
        root.self = {
            id: crypto.randomUUID(),
            type: dragging.value,
            title: dragging.value === 'team' ? 'New Team' : 'New User',
            description: dragging.value === 'team' ? 'Container for multiple users or equipment' : 'Known or custom individual'
        }
    }
}

function updateNodeInTree(updatedNode) {
    function applyUpdate(node) {
        if (node.self?.id === updatedNode.id) {
            node.self = { ...node.self, ...updatedNode };
            return true;
        }
        for (const child of node.children || []) {
            if (applyUpdate(child)) return true;
        }
        return false;
    }
    applyUpdate(tree.value);
}

/**
 * Remove the node with the given id from the tree and return it.
 * Returns null if not found.
 */
function extractNodeById(root, id) {
    const children = root.children || [];
    for (let i = 0; i < children.length; i++) {
        if (children[i].self?.id === id) {
            return children.splice(i, 1)[0];
        }
        const found = extractNodeById(children[i], id);
        if (found) return found;
    }
    return null;
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
