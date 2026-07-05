import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import AuthLayout from "@/layouts/AuthLayout.vue";
import GuestLayout from "@/layouts/GuestLayout.vue";
import { useAuthStore } from "@/stores/auth";

const routers: RouteRecordRaw[] = [
    {
        path: "/",
        component: GuestLayout,
        children: [
            {
                path: "/",
                redirect: "login"
            },
            {
                path: "login",
                name: "Login",
                component: () => import("@/views/LoginPortal.vue"),
            },
            {
                path: ":pathMatch(.*)*",
                name: "NotFound",
                component: () => import("@/views/NotFound.vue"),
            }
        ]
    },
    {
        path: "/",
        component: AuthLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: "upload",
                name: "Upload",
                component: () => import("@/views/FilesPlane.vue"),
                children: [
                    { path: "a", redirect: "/upload/pagea" },
                ],
            },
            {
                path: "tasks",
                name: "TaskPlane",
                component: () => import("@/views/TaskPlane.vue"),
                children: [
                    { path: "b", redirect: "/tasks/pageb" },
                ],
            },
            {
                path: "terminal",
                name: "TerminalPlane",
                component: () => import("@/views/TerminalPlane.vue")
            }
        ]
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes: routers
});

// Global auth guard - check once per navigation
router.beforeEach((to) => {
    const auth = useAuthStore();

    const isProtectedRoute = to.matched.some(r => r.meta.requiresAuth === true)
    // If navigating to a protected route and not authenticated, redirect to login
    if (isProtectedRoute && !auth.isAuthenticated) {
        console.log(`Redirecting ${to.path} → /login`);
        return "/login";
    }
    console.log("to next" + to.fullPath)

    return true;
});

export default router;

