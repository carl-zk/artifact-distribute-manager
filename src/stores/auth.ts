import { defineStore } from "pinia";
import { ref, type Ref } from "vue";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        isAuthenticated: false as boolean
    }),
    actions: {
        login() {
            this.isAuthenticated = true;
        },

        logout() {
            this.isAuthenticated = false;
        }
    }
});

