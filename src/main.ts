import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "@/stores/auth";

import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/js/bootstrap.bundle";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: "Login" };
    }

    if (to.name === "Login" && authStore.isAuthenticated) {
        return { name: "Home" };
    }

    return true;
});

app.mount("#app");
