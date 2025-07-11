<template>
    <div ref='container'/>
</template>

<script setup>
import { onMounted, ref, h, useTemplateRef } from 'vue';

const containerRef = useTemplateRef('container');

const props = defineProps({
    grab: {
        type: Function,
        default: () => {}
    },
    release: {
        type: Function,
        default: () => {}
    },
    snapping: {
        type: Function,
        default: () => true
    },
    rearrange: {
        type: Function,
        default: () => false
    },
    spacing_x: {
        type: Number,
        default: 20
    },
    spacing_y: {
        type: Number,
        default: 80
    }
});

defineExpose({
    deleteBlocks
});

const loaded = ref(false);
const active = ref(false);
const blocks = ref([]);

onMounted(() => {
    if (!containerRef.value) throw new Error('Canvas element not found');

    if (!loaded.value) loaded.value = true;

    var blockstemp = [];
    var absx = 0;
    var absy = 0;
    if (window.getComputedStyle(containerRef.value).position == "absolute" || window.getComputedStyle(containerRef.value).position == "fixed") {
        absx = containerRef.value.getBoundingClientRect().left;
        absy = containerRef.value.getBoundingClientRect().top;
    }
    var offsetleft = 0;
    var rearrange = false;
    var drag, dragx, dragy, original;
    var mouse_x, mouse_y;
    var dragblock = false;
    var prevblock = 0;
    var el = h("div");
    el.classList.add('indicator');
    el.classList.add('invisible');
    containerRef.value.appendChild(el);

    document.addEventListener("mousedown", beginDrag);
    document.addEventListener("mousedown", touchblock, false);
    document.addEventListener("touchstart", beginDrag);
    document.addEventListener("touchstart", touchblock, false);


    document.addEventListener("mouseup", touchblock, false);
    document.addEventListener("mousemove", moveBlock, false);
    document.addEventListener("touchmove", moveBlock, false);

    document.addEventListener("mouseup", endDrag, false);
    document.addEventListener("touchend", endDrag, false);
});

function importOutput(output) {
    containerRef.value.innerHTML = output.html;
    for (var a = 0; a < output.blockarr.length; a++) {
        blocks.value.push({
            childwidth: parseFloat(output.blockarr[a].childwidth),
            parent: parseFloat(output.blockarr[a].parent),
            id: parseFloat(output.blockarr[a].id),
            x: parseFloat(output.blockarr[a].x),
            y: parseFloat(output.blockarr[a].y),
            width: parseFloat(output.blockarr[a].width),
            height: parseFloat(output.blockarr[a].height)
        })
    }
    if (blocks.value.length > 1) {
        rearrangeMe();
        checkOffset();
    }
}

function output() {
    var html_ser = containerRef.value.innerHTML;
    var json_data = {
        html: html_ser,
        blockarr: blocks,
        blocks: []
    };
    if (blocks.value.length > 0) {
        for (var i = 0; i < blocks.value.length; i++) {
            json_data.blocks.push({
                id: blocks[i].id,
                parent: blocks[i].parent,
                data: [],
                attr: []
            });
            var blockParent = document.querySelector(".blockid[value='" + blocks[i].id + "']").parentNode;
            blockParent.querySelectorAll("input").forEach(function(block) {
                var json_name = block.getAttribute("name");
                var json_value = block.value;
                json_data.blocks[i].data.push({
                    name: json_name,
                    value: json_value
                });
            });
            Array.prototype.slice.call(blockParent.attributes).forEach(function(attribute) {
                var jsonobj = {};
                jsonobj[attribute.name] = attribute.value;
                json_data.blocks[i].attr.push(jsonobj);
            });
        }
        return json_data;
    }
}

function deleteBlocks() {
    blocks = [];
    containerRef.value.innerHTML = "<div class='indicator invisible'></div>";
}

function beginDrag(event) {
    if (window.getComputedStyle(containerRef.value).position == "absolute" || window.getComputedStyle(containerRef.value).position == "fixed") {
        absx = containerRef.value.getBoundingClientRect().left;
        absy = containerRef.value.getBoundingClientRect().top;
    }
    if (event.targetTouches) {
        mouse_x = event.changedTouches[0].clientX;
        mouse_y = event.changedTouches[0].clientY;
    } else {
        mouse_x = event.clientX;
        mouse_y = event.clientY;
    }
    if (event.which != 3 && event.target.closest(".create-flowy")) {
        original = event.target.closest(".create-flowy");
        var newNode = event.target.closest(".create-flowy").cloneNode(true);
        event.target.closest(".create-flowy").classList.add("dragnow");
        newNode.classList.add("block");
        newNode.classList.remove("create-flowy");
        if (blocks.value.length === 0) {
            newNode.innerHTML += "<input type='hidden' name='blockid' class='blockid' value='" + blocks.value.length + "'>";
            document.body.appendChild(newNode);
            drag = document.querySelector(".blockid[value='" + blocks.value.length + "']").parentNode;
        } else {
            newNode.innerHTML += "<input type='hidden' name='blockid' class='blockid' value='" + (Math.max.apply(Math, blocks.value.map(a => a.id)) + 1) + "'>";
            document.body.appendChild(newNode);
            drag = document.querySelector(".blockid[value='" + (parseInt(Math.max.apply(Math, blocks.value.map(a => a.id))) + 1) + "']").parentNode;
        }
        blockGrabbed(event.target.closest(".create-flowy"));
        drag.classList.add("dragging");
        active.value = true;
        dragx = mouse_x - (event.target.closest(".create-flowy").getBoundingClientRect().left);
        dragy = mouse_y - (event.target.closest(".create-flowy").getBoundingClientRect().top);
        drag.style.left = mouse_x - dragx + "px";
        drag.style.top = mouse_y - dragy + "px";
    }
}

function endDrag(event) {
    if (event.which != 3 && (active.value || rearrange)) {
        dragblock = false;
        blockReleased();
        if (!document.querySelector(".indicator").classList.contains("invisible")) {
            document.querySelector(".indicator").classList.add("invisible");
        }
        if (active.value) {
            original.classList.remove("dragnow");
            drag.classList.remove("dragging");
        }
        if (parseInt(drag.querySelector(".blockid").value) === 0 && rearrange) {
            firstBlock("rearrange")
        } else if (active.value && blocks.value.length == 0 && (drag.getBoundingClientRect().top + window.scrollY) > (containerRef.value.getBoundingClientRect().top + window.scrollY) && (drag.getBoundingClientRect().left + window.scrollX) > (containerRef.value.getBoundingClientRect().left + window.scrollX)) {
            firstBlock("drop");
        } else if (active.value && blocks.value.length == 0) {
            removeSelection();
        } else if (active.value) {
            var blocko = blocks.value.map(a => a.id);
            for (var i = 0; i < blocks.value.length; i++) {
                if (checkAttach(blocko[i])) {
                    active.value = false;
                    if (blockSnap(drag, false, document.querySelector(".blockid[value='" + blocko[i] + "']").parentNode)) {
                        snap(drag, i, blocko);
                    } else {
                        active.value = false;
                        removeSelection();
                    }
                    break;
                } else if (i == blocks.value.length - 1) {
                    active.value = false;
                    removeSelection();
                }
            }
        } else if (rearrange) {
            var blocko = blocks.value.map(a => a.id);
            for (var i = 0; i < blocks.value.length; i++) {
                if (checkAttach(blocko[i])) {
                    active.value = false;
                    drag.classList.remove("dragging");
                    snap(drag, i, blocko);
                    break;
                } else if (i == blocks.value.length - 1) {
                    if (beforeDelete(drag, blocks.value.filter(id => id.id == blocko[i])[0])) {
                        active.value = false;
                        drag.classList.remove("dragging");
                        snap(drag, blocko.indexOf(prevblock), blocko);
                        break;
                    } else {
                        rearrange = false;
                        blockstemp = [];
                        active.value = false;
                        removeSelection();
                        break;
                    }
                }
            }
        }
    }
}

function checkAttach(id) {
    const xpos = (drag.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(drag).width) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left;
    const ypos = (drag.getBoundingClientRect().top + window.scrollY) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top;
    if (xpos >= blocks.value.filter(a => a.id == id)[0].x - (blocks.value.filter(a => a.id == id)[0].width / 2) - props.spacing_x && xpos <= blocks.filter(a => a.id == id)[0].x + (blocks.filter(a => a.id == id)[0].width / 2) + props.spacing_x && ypos >= blocks.filter(a => a.id == id)[0].y - (blocks.filter(a => a.id == id)[0].height / 2) && ypos <= blocks.value.filter(a => a.id == id)[0].y + blocks.value.filter(a => a.id == id)[0].height) {
        return true;
    } else {
        return false;
    }
}

function removeSelection() {
    containerRef.value.appendChild(document.querySelector(".indicator"));
    drag.parentNode.removeChild(drag);
}

function firstBlock(type) {
    if (type == "drop") {
        blockSnap(drag, true, undefined);
        active.value = false;
        drag.style.top = (drag.getBoundingClientRect().top + window.scrollY) - (absy + window.scrollY) + containerRef.value.scrollTop + "px";
        drag.style.left = (drag.getBoundingClientRect().left + window.scrollX) - (absx + window.scrollX) + containerRef.value.scrollLeft + "px";
        containerRef.value.appendChild(drag);
        blocks.value.push({
            parent: -1,
            childwidth: 0,
            id: parseInt(drag.querySelector(".blockid").value),
            x: (drag.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(drag).width) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left,
            y: (drag.getBoundingClientRect().top + window.scrollY) + (parseInt(window.getComputedStyle(drag).height) / 2) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top,
            width: parseInt(window.getComputedStyle(drag).width),
            height: parseInt(window.getComputedStyle(drag).height)
        });
    } else if (type == "rearrange") {
        drag.classList.remove("dragging");
        rearrange = false;
        for (var w = 0; w < blockstemp.length; w++) {
            if (blockstemp[w].id != parseInt(drag.querySelector(".blockid").value)) {
                const blockParent = document.querySelector(".blockid[value='" + blockstemp[w].id + "']").parentNode;
                const arrowParent = document.querySelector(".arrowid[value='" + blockstemp[w].id + "']").parentNode;
                blockParent.style.left = (blockParent.getBoundingClientRect().left + window.scrollX) - (window.scrollX) + containerRef.value.scrollLeft - 1 - absx + "px";
                blockParent.style.top = (blockParent.getBoundingClientRect().top + window.scrollY) - (window.scrollY) + containerRef.value.scrollTop - absy - 1 + "px";
                arrowParent.style.left = (arrowParent.getBoundingClientRect().left + window.scrollX) - (window.scrollX) + containerRef.value.scrollLeft - absx - 1 + "px";
                arrowParent.style.top = (arrowParent.getBoundingClientRect().top + window.scrollY) + containerRef.value.scrollTop - 1 - absy + "px";
                containerRef.value.appendChild(blockParent);
                containerRef.value.appendChild(arrowParent);
                blockstemp[w].x = (blockParent.getBoundingClientRect().left + window.scrollX) + (parseInt(blockParent.offsetWidth) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left - 1;
                blockstemp[w].y = (blockParent.getBoundingClientRect().top + window.scrollY) + (parseInt(blockParent.offsetHeight) / 2) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top - 1;
            }
        }
        blockstemp.filter(a => a.id == 0)[0].x = (drag.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(drag).width) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left;
        blockstemp.filter(a => a.id == 0)[0].y = (drag.getBoundingClientRect().top + window.scrollY) + (parseInt(window.getComputedStyle(drag).height) / 2) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top;
        blocks = blocks.value.concat(blockstemp);
        blockstemp = [];
    }
}

function drawArrow(arrow, x, y, id) {
    if (x < 0) {
        containerRef.value.innerHTML += '<div class="arrowblock"><input type="hidden" class="arrowid" value="' + drag.querySelector(".blockid").value + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M' + (blocks.value.filter(a => a.id == id)[0].x - arrow.x + 5) + ' 0L' + (blocks.value.filter(a => a.id == id)[0].x - arrow.x + 5) + ' ' + (props.spacing_y / 2) + 'L5 ' + (props.spacing_y / 2) + 'L5 ' + y + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M0 ' + (y - 5) + 'H10L5 ' + y + 'L0 ' + (y - 5) + 'Z" fill="#C5CCD0"/></svg></div>';
        document.querySelector('.arrowid[value="' + drag.querySelector(".blockid").value + '"]').parentNode.style.left = (arrow.x - 5) - (absx + window.scrollX) + containerRef.value.scrollLeft + containerRef.value.getBoundingClientRect().left + "px";
    } else {
        containerRef.value.innerHTML += '<div class="arrowblock"><input type="hidden" class="arrowid" value="' + drag.querySelector(".blockid").value + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0L20 ' + (props.spacing_y / 2) + 'L' + (x) + ' ' + (props.spacing_y / 2) + 'L' + x + ' ' + y + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M' + (x - 5) + ' ' + (y - 5) + 'H' + (x + 5) + 'L' + x + ' ' + y + 'L' + (x - 5) + ' ' + (y - 5) + 'Z" fill="#C5CCD0"/></svg></div>';
        document.querySelector('.arrowid[value="' + parseInt(drag.querySelector(".blockid").value) + '"]').parentNode.style.left = blocks.value.filter(a => a.id == id)[0].x - 20 - (absx + window.scrollX) + containerRef.value.scrollLeft + containerRef.value.getBoundingClientRect().left + "px";
    }
    document.querySelector('.arrowid[value="' + parseInt(drag.querySelector(".blockid").value) + '"]').parentNode.style.top = blocks.value.filter(a => a.id == id)[0].y + (blocks.value.filter(a => a.id == id)[0].height / 2) + containerRef.value.getBoundingClientRect().top - absy + "px";
}

function updateArrow(arrow, x, y, children) {
    if (x < 0) {
        document.querySelector('.arrowid[value="' + children.id + '"]').parentNode.style.left = (arrow.x - 5) - (absx + window.scrollX) + containerRef.value.getBoundingClientRect().left + "px";
        document.querySelector('.arrowid[value="' + children.id + '"]').parentNode.innerHTML = '<input type="hidden" class="arrowid" value="' + children.id + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M' + (blocks.value.filter(id => id.id == children.parent)[0].x - arrow.x + 5) + ' 0L' + (blocks.value.filter(id => id.id == children.parent)[0].x - arrow.x + 5) + ' ' + (props.spacing_y / 2) + 'L5 ' + (props.spacing_y / 2) + 'L5 ' + y + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M0 ' + (y - 5) + 'H10L5 ' + y + 'L0 ' + (y - 5) + 'Z" fill="#C5CCD0"/></svg>';
    } else {
        document.querySelector('.arrowid[value="' + children.id + '"]').parentNode.style.left = blocks.value.filter(id => id.id == children.parent)[0].x - 20 - (absx + window.scrollX) + containerRef.value.getBoundingClientRect().left + "px";
        document.querySelector('.arrowid[value="' + children.id + '"]').parentNode.innerHTML = '<input type="hidden" class="arrowid" value="' + children.id + '"><svg preserveaspectratio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 0L20 ' + (props.spacing_y / 2) + 'L' + (x) + ' ' + (props.spacing_y / 2) + 'L' + x + ' ' + y + '" stroke="#C5CCD0" stroke-width="2px"/><path d="M' + (x - 5) + ' ' + (y - 5) + 'H' + (x + 5) + 'L' + x + ' ' + y + 'L' + (x - 5) + ' ' + (y - 5) + 'Z" fill="#C5CCD0"/></svg>';
    }
}

function snap(drag, i, blocko) {
    if (!rearrange) {
        containerRef.value.appendChild(drag);
    }
    var totalwidth = 0;
    var totalremove = 0;
    var maxheight = 0;
    for (var w = 0; w < blocks.value.filter(id => id.parent == blocko[i]).length; w++) {
        var children = blocks.value.filter(id => id.parent == blocko[i])[w];
        if (children.childwidth > children.width) {
            totalwidth += children.childwidth + props.spacing_x;
        } else {
            totalwidth += children.width + props.spacing_x;
        }
    }
    totalwidth += parseInt(window.getComputedStyle(drag).width);
    for (var w = 0; w < blocks.value.filter(id => id.parent == blocko[i]).length; w++) {
        var children = blocks.value.filter(id => id.parent == blocko[i])[w];
        if (children.childwidth > children.width) {
            document.querySelector(".blockid[value='" + children.id + "']").parentNode.style.left = blocks.value.filter(a => a.id == blocko[i])[0].x - (totalwidth / 2) + totalremove + (children.childwidth / 2) - (children.width / 2) + "px";
            children.x = blocks.value.filter(id => id.parent == blocko[i])[0].x - (totalwidth / 2) + totalremove + (children.childwidth / 2);
            totalremove += children.childwidth + props.spacing_x;
        } else {
            document.querySelector(".blockid[value='" + children.id + "']").parentNode.style.left = blocks.value.filter(a => a.id == blocko[i])[0].x - (totalwidth / 2) + totalremove + "px";
            children.x = blocks.value.filter(id => id.parent == blocko[i])[0].x - (totalwidth / 2) + totalremove + (children.width / 2);
            totalremove += children.width + props.spacing_x;
        }
    }
    drag.style.left = blocks.value.filter(id => id.id == blocko[i])[0].x - (totalwidth / 2) + totalremove - (window.scrollX + absx) + containerRef.value.scrollLeft + containerRef.value.getBoundingClientRect().left + "px";
    drag.style.top = blocks.value.filter(id => id.id == blocko[i])[0].y + (blocks.value.filter(id => id.id == blocko[i])[0].height / 2) + props.spacing_y - (window.scrollY + absy) + containerRef.value.getBoundingClientRect().top + "px";
    if (rearrange) {
        blockstemp.filter(a => a.id == parseInt(drag.querySelector(".blockid").value))[0].x = (drag.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(drag).width) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left;
        blockstemp.filter(a => a.id == parseInt(drag.querySelector(".blockid").value))[0].y = (drag.getBoundingClientRect().top + window.scrollY) + (parseInt(window.getComputedStyle(drag).height) / 2) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top;
        blockstemp.filter(a => a.id == drag.querySelector(".blockid").value)[0].parent = blocko[i];
        for (var w = 0; w < blockstemp.length; w++) {
            if (blockstemp[w].id != parseInt(drag.querySelector(".blockid").value)) {
                const blockParent = document.querySelector(".blockid[value='" + blockstemp[w].id + "']").parentNode;
                const arrowParent = document.querySelector(".arrowid[value='" + blockstemp[w].id + "']").parentNode;
                blockParent.style.left = (blockParent.getBoundingClientRect().left + window.scrollX) - (window.scrollX + containerRef.value.getBoundingClientRect().left) + containerRef.value.scrollLeft + "px";
                blockParent.style.top = (blockParent.getBoundingClientRect().top + window.scrollY) - (window.scrollY + containerRef.value.getBoundingClientRect().top) + containerRef.value.scrollTop + "px";
                arrowParent.style.left = (arrowParent.getBoundingClientRect().left + window.scrollX) - (window.scrollX + containerRef.value.getBoundingClientRect().left) + containerRef.value.scrollLeft + 20 + "px";
                arrowParent.style.top = (arrowParent.getBoundingClientRect().top + window.scrollY) - (window.scrollY + containerRef.value.getBoundingClientRect().top) + containerRef.value.scrollTop + "px";
                containerRef.value.appendChild(blockParent);
                containerRef.value.appendChild(arrowParent);

                blockstemp[w].x = (blockParent.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(blockParent).width) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left;
                blockstemp[w].y = (blockParent.getBoundingClientRect().top + window.scrollY) + (parseInt(window.getComputedStyle(blockParent).height) / 2) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top;
            }
        }
        blocks = blocks.value.concat(blockstemp);
        blockstemp = [];
    } else {
        blocks.value.push({
            childwidth: 0,
            parent: blocko[i],
            id: parseInt(drag.querySelector(".blockid").value),
            x: (drag.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(drag).width) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left,
            y: (drag.getBoundingClientRect().top + window.scrollY) + (parseInt(window.getComputedStyle(drag).height) / 2) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top,
            width: parseInt(window.getComputedStyle(drag).width),
            height: parseInt(window.getComputedStyle(drag).height)
        });
    }

    var arrowblock = blocks.value.filter(a => a.id == parseInt(drag.querySelector(".blockid").value))[0];
    var arrowx = arrowblock.x - blocks.value.filter(a => a.id == blocko[i])[0].x + 20;
    var arrowy = props.spacing_y;
    drawArrow(arrowblock, arrowx, arrowy, blocko[i]);

    if (blocks.value.filter(a => a.id == blocko[i])[0].parent != -1) {
        var flag = false;
        var idval = blocko[i];
        while (!flag) {
            if (blocks.value.filter(a => a.id == idval)[0].parent == -1) {
                flag = true;
            } else {
                var zwidth = 0;
                for (var w = 0; w < blocks.value.filter(id => id.parent == idval).length; w++) {
                    var children = blocks.value.filter(id => id.parent == idval)[w];
                    if (children.childwidth > children.width) {
                        if (w == blocks.value.filter(id => id.parent == idval).length - 1) {
                            zwidth += children.childwidth;
                        } else {
                            zwidth += children.childwidth + props.spacing_x;
                        }
                    } else {
                        if (w == blocks.value.filter(id => id.parent == idval).length - 1) {
                            zwidth += children.width;
                        } else {
                            zwidth += children.width + props.spacing_x;
                        }
                    }
                }
                blocks.value.filter(a => a.id == idval)[0].childwidth = zwidth;
                idval = blocks.value.filter(a => a.id == idval)[0].parent;
            }
        }
        blocks.value.filter(id => id.id == idval)[0].childwidth = totalwidth;
    }
    if (rearrange) {
        rearrange = false;
        drag.classList.remove("dragging");
    }
    rearrangeMe();
    checkOffset();
}

function touchblock(event) {
    dragblock = false;
    if (hasParentClass(event.target, "block")) {
        var theblock = event.target.closest(".block");
        if (event.targetTouches) {
            mouse_x = event.targetTouches[0].clientX;
            mouse_y = event.targetTouches[0].clientY;
        } else {
            mouse_x = event.clientX;
            mouse_y = event.clientY;
        }
        if (event.type !== "mouseup" && hasParentClass(event.target, "block")) {
            if (event.which != 3) {
                if (!active.value && !rearrange) {
                    dragblock = true;
                    drag = theblock;
                    dragx = mouse_x - (drag.getBoundingClientRect().left + window.scrollX);
                    dragy = mouse_y - (drag.getBoundingClientRect().top + window.scrollY);
                }
            }
        }
    }
}

function hasParentClass(element, classname) {
    if (element.className) {
        if (element.className.split(' ').indexOf(classname) >= 0) return true;
    }
    return element.parentNode && hasParentClass(element.parentNode, classname);
}

function moveBlock(event) {
    if (event.targetTouches) {
        mouse_x = event.targetTouches[0].clientX;
        mouse_y = event.targetTouches[0].clientY;
    } else {
        mouse_x = event.clientX;
        mouse_y = event.clientY;
    }
    if (dragblock) {
        rearrange = true;
        drag.classList.add("dragging");
        var blockid = parseInt(drag.querySelector(".blockid").value);
        prevblock = blocks.value.filter(a => a.id == blockid)[0].parent;
        blockstemp.push(blocks.value.filter(a => a.id == blockid)[0]);
        blocks = blocks.value.filter(function(e) {
            return e.id != blockid
        });
        if (blockid != 0) {
            document.querySelector(".arrowid[value='" + blockid + "']").parentNode.remove();
        }
        var layer = blocks.value.filter(a => a.parent == blockid);
        var flag = false;
        var foundids = [];
        var allids = [];
        while (!flag) {
            for (var i = 0; i < layer.length; i++) {
                if (layer[i] != blockid) {
                    blockstemp.push(blocks.value.filter(a => a.id == layer[i].id)[0]);
                    const blockParent = document.querySelector(".blockid[value='" + layer[i].id + "']").parentNode;
                    const arrowParent = document.querySelector(".arrowid[value='" + layer[i].id + "']").parentNode;
                    blockParent.style.left = (blockParent.getBoundingClientRect().left + window.scrollX) - (drag.getBoundingClientRect().left + window.scrollX) + "px";
                    blockParent.style.top = (blockParent.getBoundingClientRect().top + window.scrollY) - (drag.getBoundingClientRect().top + window.scrollY) + "px";
                    arrowParent.style.left = (arrowParent.getBoundingClientRect().left + window.scrollX) - (drag.getBoundingClientRect().left + window.scrollX) + "px";
                    arrowParent.style.top = (arrowParent.getBoundingClientRect().top + window.scrollY) - (drag.getBoundingClientRect().top + window.scrollY) + "px";
                    drag.appendChild(blockParent);
                    drag.appendChild(arrowParent);
                    foundids.push(layer[i].id);
                    allids.push(layer[i].id);
                }
            }
            if (foundids.length == 0) {
                flag = true;
            } else {
                layer = blocks.value.filter(a => foundids.includes(a.parent));
                foundids = [];
            }
        }
        for (var i = 0; i < blocks.value.filter(a => a.parent == blockid).length; i++) {
            var blocknumber = blocks.value.filter(a => a.parent == blockid)[i];
            blocks = blocks.value.filter(function(e) {
                return e.id != blocknumber
            });
        }
        for (var i = 0; i < allids.length; i++) {
            var blocknumber = allids[i];
            blocks = blocks.value.filter(function(e) {
                return e.id != blocknumber
            });
        }
        if (blocks.value.length > 1) {
            rearrangeMe();
        }
        dragblock = false;
    }
    if (active.value) {
        drag.style.left = mouse_x - dragx + "px";
        drag.style.top = mouse_y - dragy + "px";
    } else if (rearrange) {
        drag.style.left = mouse_x - dragx - (window.scrollX + absx) + containerRef.value.scrollLeft + "px";
        drag.style.top = mouse_y - dragy - (window.scrollY + absy) + containerRef.value.scrollTop + "px";
        blockstemp.filter(a => a.id == parseInt(drag.querySelector(".blockid").value)).x = (drag.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(drag).width) / 2) + containerRef.value.scrollLeft;
        blockstemp.filter(a => a.id == parseInt(drag.querySelector(".blockid").value)).y = (drag.getBoundingClientRect().top + window.scrollY) + (parseInt(window.getComputedStyle(drag).height) / 2) + containerRef.value.scrollTop;
    }
    if (active.value || rearrange) {
        if (mouse_x > containerRef.value.getBoundingClientRect().width + containerRef.value.getBoundingClientRect().left - 10 && mouse_x < containerRef.value.getBoundingClientRect().width + containerRef.value.getBoundingClientRect().left + 10) {
            containerRef.value.scrollLeft += 10;
        } else if (mouse_x < containerRef.value.getBoundingClientRect().left + 10 && mouse_x > containerRef.value.getBoundingClientRect().left - 10) {
            containerRef.value.scrollLeft -= 10;
        } else if (mouse_y > containerRef.value.getBoundingClientRect().height + containerRef.value.getBoundingClientRect().top - 10 && mouse_y < containerRef.value.getBoundingClientRect().height + containerRef.value.getBoundingClientRect().top + 10) {
            containerRef.value.scrollTop += 10;
        } else if (mouse_y < containerRef.value.getBoundingClientRect().top + 10 && mouse_y > containerRef.value.getBoundingClientRect().top - 10) {
            containerRef.value.scrollLeft -= 10;
        }
        var xpos = (drag.getBoundingClientRect().left + window.scrollX) + (parseInt(window.getComputedStyle(drag).width) / 2) + containerRef.value.scrollLeft - containerRef.value.getBoundingClientRect().left;
        var ypos = (drag.getBoundingClientRect().top + window.scrollY) + containerRef.value.scrollTop - containerRef.value.getBoundingClientRect().top;
        var blocko = blocks.value.map(a => a.id);
        for (var i = 0; i < blocks.value.length; i++) {
            if (checkAttach(blocko[i])) {
                document.querySelector(".blockid[value='" + blocko[i] + "']").parentNode.appendChild(document.querySelector(".indicator"));
                document.querySelector(".indicator").style.left = (document.querySelector(".blockid[value='" + blocko[i] + "']").parentNode.offsetWidth / 2) - 5 + "px";
                document.querySelector(".indicator").style.top = document.querySelector(".blockid[value='" + blocko[i] + "']").parentNode.offsetHeight + "px";
                document.querySelector(".indicator").classList.remove("invisible");
                break;
            } else if (i == blocks.value.length - 1) {
                if (!document.querySelector(".indicator").classList.contains("invisible")) {
                    document.querySelector(".indicator").classList.add("invisible");
                }
            }
        }
    }
}

function checkOffset() {
    offsetleft = blocks.value.map(a => a.x);
    var widths = blocks.value.map(a => a.width);
    var mathmin = offsetleft.map(function(item, index) {
        return item - (widths[index] / 2);
    })
    offsetleft = Math.min.apply(Math, mathmin);
    if (offsetleft < (containerRef.value.getBoundingClientRect().left + window.scrollX - absx)) {
        var blocko = blocks.value.map(a => a.id);
        for (var w = 0; w < blocks.length; w++) {
            document.querySelector(".blockid[value='" + blocks.value.filter(a => a.id == blocko[w])[0].id + "']").parentNode.style.left = blocks.value.filter(a => a.id == blocko[w])[0].x - (blocks.value.filter(a => a.id == blocko[w])[0].width / 2) - offsetleft + containerRef.value.getBoundingClientRect().left - absx + 20 + "px";
            if (blocks.value.filter(a => a.id == blocko[w])[0].parent != -1) {
                var arrowblock = blocks.value.filter(a => a.id == blocko[w])[0];
                var arrowx = arrowblock.x - blocks.value.filter(a => a.id == blocks.value.filter(a => a.id == blocko[w])[0].parent)[0].x;
                if (arrowx < 0) {
                    document.querySelector('.arrowid[value="' + blocko[w] + '"]').parentNode.style.left = (arrowblock.x - offsetleft + 20 - 5) + containerRef.value.getBoundingClientRect().left - absx + "px";
                } else {
                    document.querySelector('.arrowid[value="' + blocko[w] + '"]').parentNode.style.left = blocks.value.filter(id => id.id == blocks.value.filter(a => a.id == blocko[w])[0].parent)[0].x - 20 - offsetleft + containerRef.value.getBoundingClientRect().left - absx + 20 + "px";
                }
            }
        }
        for (var w = 0; w < blocks.value.length; w++) {
            blocks[w].x = (document.querySelector(".blockid[value='" + blocks[w].id + "']").parentNode.getBoundingClientRect().left + window.scrollX) + (containerRef.value.scrollLeft) + (parseInt(window.getComputedStyle(document.querySelector(".blockid[value='" + blocks[w].id + "']").parentNode).width) / 2) - 20 - containerRef.value.getBoundingClientRect().left;
        }
    }
}

function rearrangeMe() {
    var result = blocks.value.map(a => a.parent);
    for (var z = 0; z < result.length; z++) {
        if (result[z] == -1) {
            z++;
        }
        var totalwidth = 0;
        var totalremove = 0;
        var maxheight = 0;
        for (var w = 0; w < blocks.value.filter(id => id.parent == result[z]).length; w++) {
            var children = blocks.value.filter(id => id.parent == result[z])[w];
            if (blocks.value.filter(id => id.parent == children.id).length == 0) {
                children.childwidth = 0;
            }
            if (children.childwidth > children.width) {
                if (w == blocks.value.filter(id => id.parent == result[z]).length - 1) {
                    totalwidth += children.childwidth;
                } else {
                    totalwidth += children.childwidth + props.spacing_x;
                }
            } else {
                if (w == blocks.value.filter(id => id.parent == result[z]).length - 1) {
                    totalwidth += children.width;
                } else {
                    totalwidth += children.width + props.spacing_x;
                }
            }
        }
        if (result[z] != -1) {
            blocks.value.filter(a => a.id == result[z])[0].childwidth = totalwidth;
        }
        for (var w = 0; w < blocks.value.filter(id => id.parent == result[z]).length; w++) {
            var children = blocks.value.filter(id => id.parent == result[z])[w];
            const r_block = document.querySelector(".blockid[value='" + children.id + "']").parentNode;
            const r_array = blocks.value.filter(id => id.id == result[z]);
            r_block.style.top = r_array.y + props.spacing_y + containerRef.value.getBoundingClientRect().top - absy + "px";
            r_array.y = r_array.y + props.spacing_y;
            if (children.childwidth > children.width) {
                r_block.style.left = r_array[0].x - (totalwidth / 2) + totalremove + (children.childwidth / 2) - (children.width / 2) - (absx + window.scrollX) + containerRef.value.getBoundingClientRect().left + "px";
                children.x = r_array[0].x - (totalwidth / 2) + totalremove + (children.childwidth / 2);
                totalremove += children.childwidth + props.spacing_x;
            } else {
                r_block.style.left = r_array[0].x - (totalwidth / 2) + totalremove - (absx + window.scrollX) + containerRef.value.getBoundingClientRect().left + "px";
                children.x = r_array[0].x - (totalwidth / 2) + totalremove + (children.width / 2);
                totalremove += children.width + props.spacing_x;
            }

            var arrowblock = blocks.value.filter(a => a.id == children.id)[0];
            var arrowx = arrowblock.x - blocks.value.filter(a => a.id == children.parent)[0].x + 20;
            var arrowy = props.spacing_y;
            updateArrow(arrowblock, arrowx, arrowy, children);
        }
    }
}


function blockGrabbed(block) {
    grab(block);
}

function blockReleased() {
    release();
}

function blockSnap(drag, first, parent) {
    return snapping(drag, first, parent);
}

function beforeDelete(drag, parent) {
    return rearrange(drag, parent);
}
</script>

<style scoped>

.dragging{
    z-index:111!important
}
.block{
    position:absolute;
    z-index:9
}
.indicator{
    width:12px;
    height:12px;
    border-radius:60px;
    background-color:#217ce8;
    margin-top:-5px;
    opacity:1;
    transition:all .3s cubic-bezier(.05,.03,.35,1);
    transform:scale(1);
    position:absolute;
    z-index:2
}
.invisible{
    opacity:0!important;
    transform:scale(0)
}
.indicator:after{
    content:"";
    display:block;
    width:12px;
    height:12px;
    background-color:#217ce8;
    transform:scale(1.7);
    opacity:.2;
    border-radius:60px
}
.arrowblock{
    position:absolute;
    width:100%;
    overflow:visible;
    pointer-events:none
}
.arrowblock svg{
    width: -webkit-fill-available;
    overflow: visible;
}
</style>
