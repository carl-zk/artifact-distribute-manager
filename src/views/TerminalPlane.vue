<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useTerminal } from '@/composables/useTerminal';
import 'xterm/css/xterm.css'


const { container, open } = useTerminal()

onMounted(async () => {
    await open({
        targetType: 'SERVER'
    })
})

</script>

<template>
    <div class="terminal-page">
        <div class="terminal-window">
            <div ref="container" class="terminal"></div>
        </div>
    </div>
</template>

<style>
.terminal-page {
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    background: #f5f5f5;
}

/* fixed terminal window */
.terminal-window {
    /*   width: 900px;
 height: 500px; */

    width: 100%;
    height: 100%;

    background: #111;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

    display: flex;
}

/* xterm mount point */
.terminal {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>