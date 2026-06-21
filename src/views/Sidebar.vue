<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { House, Gauge, FolderUp, CloudBackup, ListCheck } from "lucide-vue-next";
import { BIconHouseDoor, BIconFolderPlus, BIconCloudArrowUp } from "bootstrap-icons-vue";

const route = useRoute();
const router = useRouter();

const pages = [
    { key: "Upload", path: "/upload", icon: BIconFolderPlus },
    { key: "Deliver", path: "/tasks", icon: BIconCloudArrowUp },
];

function navigate(path: string) {
    router.push(path);
}

const collapsed = ref(false);
function toggleCollapse() {
    collapsed.value = !collapsed.value;
}
</script>

<template>
    <div :class="['sidebar d-flex flex-column flex-shrink-0 p-1 text-bg-dark', collapsed ? 'collapsed' : '']">
        <a href="#" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none"
            @click.prevent="navigate('/')">
            <BIconHouseDoor :font-size="22" class="me-1" />
            <span class="fs-5">Artifact Distributor</span>
        </a>
        <div class="collapse-toggle">
            <label role="button" tabindex="0"
                :class="['collapse-btn btn btn-sm btn-outline-light', { rotated: collapsed }]" @click="toggleCollapse"
                @keydown.enter.prevent="toggleCollapse" @keydown.space.prevent="toggleCollapse"
                :aria-pressed="collapsed" aria-label="Toggle sidebar">
                <svg class="bi" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <polyline points="10 4 6 8 10 12" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </label>
        </div>

        <hr />

        <ul class="nav nav-pills flex-column mb-auto">
            <li class="nav-item" v-for="page in pages" :key="page.key">
                <a href="#" :class="['nav-link', route.path === page.path ? 'active' : 'text-white']"
                    @click.prevent="navigate(page.path)" :aria-current="route.path === page.path ? 'page' : undefined">
                    <component :is="page.icon" :size="16" class="me-2" />
                    <span class="nav-label">{{ page.key }}</span>
                </a>
            </li>
        </ul>

        <hr />
    </div>
</template>

<style scoped>
.sidebar {
    min-height: 100%;
    width: 280px;
    position: relative;
}

.sidebar.collapsed {
    width: 34px;
}

.sidebar .nav-label {
    vertical-align: middle;
}

.sidebar.collapsed .nav-label {
    display: flex;
    justify-content: center;
    padding: 1.5rem;
}

.sidebar.collapsed .fs-5 {
    display: none
}

.collapse-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translate(0, -50%);
    z-index: 50;
}

.collapse-toggle .collapse-btn {
    border-radius: 50%;
    width: 34px;
    height: 34px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.collapse-toggle .collapse-btn svg {
    transition: transform 0.15s ease;
    transform-origin: 50% 50%;
}

.collapse-toggle .collapse-btn.rotated svg {
    transform: rotate(180deg);
}

/* When sidebar is collapsed, show only icons */
.sidebar.collapsed .nav-link {
    padding: 0.5rem;
    display: none;
    justify-content: center;
}

.sidebar.collapsed .nav-link svg {
    margin: 0 !important;
}
</style>
