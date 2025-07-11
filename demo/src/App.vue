<template>
    <div id='leftcard'>
        <div id='blocklist'>
            <div class='blockelem create-flowy noselect'>
                <input
                    type='hidden'
                    name='blockelemtype'
                    class='blockelemtype'
                    value='1'
                >
                <div class='grabme'>
                    <img src='/assets/grabme.svg'>
                </div>
                <div class='blockin'>
                    <div class='blockico'>
                        <span />
                        <img src='/assets/eye.svg'>
                    </div>
                    <div class='blocktext'>
                        <p class='blocktitle'>
                            New visitor
                        </p>
                        <p class='blockdesc'>
                            Triggers when somebody visits a specified page
                        </p>
                    </div>
                </div>
            </div>
            <div class='blockelem create-flowy noselect'>
                <input
                    type='hidden'
                    name='blockelemtype'
                    class='blockelemtype'
                    value='2'
                >
                <div class='grabme'>
                    <img src='/assets/grabme.svg'>
                </div>
                <div class='blockin'>
                    <div class='blockico'>
                        <span />
                        <img src='/assets/action.svg'>
                    </div>
                    <div class='blocktext'>
                        <p class='blocktitle'>
                            Action is performed
                        </p>
                        <p class='blockdesc'>
                            Triggers when somebody performs a specified action
                        </p>
                    </div>
                </div>
            </div>
            <div class='blockelem create-flowy noselect'>
                <input
                    type='hidden'
                    name='blockelemtype'
                    class='blockelemtype'
                    value='3'
                >
                <div class='grabme'>
                    <img src='/assets/grabme.svg'>
                </div>
                <div class='blockin'>
                    <div class='blockico'>
                        <span />
                        <img src='/assets/time.svg'>
                    </div>
                    <div class='blocktext'>
                        <p class='blocktitle'>
                            Time has passed
                        </p>
                        <p class='blockdesc'>
                            Triggers after a specified amount of time
                        </p>
                    </div>
                </div>
            </div>
            <div class='blockelem create-flowy noselect'>
                <input
                    type='hidden'
                    name='blockelemtype'
                    class='blockelemtype'
                    value='4'
                >
                <div class='grabme'>
                    <img src='/assets/grabme.svg'>
                </div>
                <div class='blockin'>
                    <div class='blockico'>
                        <span />
                        <img src='/assets/error.svg'>
                    </div>
                    <div class='blocktext'>
                        <p class='blocktitle'>
                            Error prompt
                        </p>
                        <p class='blockdesc'>
                            Triggers when a specified error happens
                        </p>
                    </div>
                </div>
            </div>
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
            <div id='divisionthing' />

            <div
                id='removeblock'
                @click='deleteBlocks'
            >
                Delete blocks
            </div>
        </div>
    </div>

    <HastyTeam
        ref='hasty'
        :drag='drag'
        :release='release'
        :snapping='snapping'
    />
</template>

<script setup>
import { ref, onMounted, useTemplateRef } from 'vue'
import { HastyTeam } from '../../lib.js'

const hastyRef = useTemplateRef('hasty');

const rightcard = ref(false);

onMounted(() => {
    var tempblock;
    var tempblock2;

    var aclick = false;
    var noinfo = false;

    const beginTouch = (event) => {
        aclick = true;
        noinfo = false;
        if (event.target.closest(".create-flowy")) {
            noinfo = true;
        }
    }

    addEventListener("mousedown", beginTouch, false);
    addEventListener("mousemove", () => {
        aclick = false;
    }, false);
    addEventListener("mouseup", (event) => {
        if (event.type === "mouseup" && aclick && !noinfo) {
            if (!rightcard.value && event.target.closest(".block") && !event.target.closest(".block").classList.contains("dragging")) {
                tempblock = event.target.closest(".block");
                rightcard.value = true;
                document.getElementById("properties").classList.add("expanded");
                document.getElementById("propwrap").classList.add("itson");
                tempblock.classList.add("selectedblock");
            }
        }
    }, false);

    addEventListenerMulti("touchstart", beginTouch, false, ".block");
});

function addEventListenerMulti(type, listener, capture, selector) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].addEventListener(type, listener, capture);
    }
}

function snapping(drag, first) {
    var grab = drag.querySelector(".grabme");
    grab.parentNode.removeChild(grab);
    var blockin = drag.querySelector(".blockin");
    blockin.parentNode.removeChild(blockin);
    if (drag.querySelector(".blockelemtype").value == "1") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/eyeblue.svg'><p class='blockyname'>New visitor</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>When a <span>new visitor</span> goes to <span>Site 1</span></div>";
    } else if (drag.querySelector(".blockelemtype").value == "2") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/actionblue.svg'><p class='blockyname'>Action is performed</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>When <span>Action 1</span> is performed</div>";
    } else if (drag.querySelector(".blockelemtype").value == "3") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/timeblue.svg'><p class='blockyname'>Time has passed</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>When <span>10 seconds</span> have passed</div>";
    } else if (drag.querySelector(".blockelemtype").value == "4") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/errorblue.svg'><p class='blockyname'>Error prompt</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>When <span>Error 1</span> is triggered</div>";
    } else if (drag.querySelector(".blockelemtype").value == "5") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/databaseorange.svg'><p class='blockyname'>New database entry</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>Add <span>Data object</span> to <span>Database 1</span></div>";
    } else if (drag.querySelector(".blockelemtype").value == "6") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/databaseorange.svg'><p class='blockyname'>Update database</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>Update <span>Database 1</span></div>";
    } else if (drag.querySelector(".blockelemtype").value == "7") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/actionorange.svg'><p class='blockyname'>Perform an action</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>Perform <span>Action 1</span></div>";
    } else if (drag.querySelector(".blockelemtype").value == "8") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/twitterorange.svg'><p class='blockyname'>Make a tweet</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>Tweet <span>Query 1</span> with the account <span>@alyssaxuu</span></div>";
    } else if (drag.querySelector(".blockelemtype").value == "9") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/logred.svg'><p class='blockyname'>Add new log entry</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>Add new <span>success</span> log entry</div>";
    } else if (drag.querySelector(".blockelemtype").value == "10") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/logred.svg'><p class='blockyname'>Update logs</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>Edit <span>Log Entry 1</span></div>";
    } else if (drag.querySelector(".blockelemtype").value == "11") {
        drag.innerHTML += "<div class='blockyleft'><img src='/assets/errorred.svg'><p class='blockyname'>Prompt an error</p></div><div class='blockyright'><img src='/assets/more.svg'></div><div class='blockydiv'></div><div class='blockyinfo'>Trigger <span>Error 1</span></div>";
    }
    return true;
}

function drag(block) {
    block.classList.add("blockdisabled");
    tempblock2 = block;
}

function release() {
    if (tempblock2) {
        tempblock2.classList.remove("blockdisabled");
    }
}


function deleteBlocks() {
    hastyRef.value.deleteBlocks();
}
</script>
