import { createRouter, createWebHistory } from "vue-router";

// Use dynamic imports for lazy-loading views
const routes = [
    { path: "/login", name: "Login", component: () => import("@/views/LoginPortal.vue") },
    { path: "/upload", name: "Upload", component: () => import("@/views/FilesPlane.vue"), meta: { requiresAuth: true } },
    { path: "/tasks", name: "TaskPlane", component: () => import("@/views/TaskPlane.vue"), meta: { requiresAuth: true } },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
