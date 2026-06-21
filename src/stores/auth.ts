import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        user: null as { name: string } | null,
        token: null as string | null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.user && !!state.token,
    },
    actions: {
        login(username: string, password: string) {
            if (!username || !password) {
                throw new Error("Username and password are required.");
            }

            // This is a stubbed login flow for the login portal.
            // Replace with real authentication logic when backend integration is available.
            this.user = { name: username };
            this.token = "demo-token";
        },
        logout() {
            this.user = null;
            this.token = null;
        },
    },
});
