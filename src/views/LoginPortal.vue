<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);

async function submitLogin() {
    errorMessage.value = null;
    isSubmitting.value = true;

    try {
        //authStore.login(username.value.trim(), password.value);
        authStore.login()
        await router.push({ name: "Upload" });
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : String(error);
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="login-portal">
        <div class="login-card card shadow-lg">
            <div class="card-body p-5">
                <div class="text-center mb-4">
                    <div
                        class="login-brand rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3">
                        <span class="fs-3 fw-bold">AM</span>
                    </div>
                    <h1 class="h4 mb-1">Artifact Manager</h1>
                </div>

                <div v-if="errorMessage" class="alert alert-danger py-2 mb-4">{{ errorMessage }}</div>

                <form @submit.prevent="submitLogin">
                    <div class="mb-3">
                        <label class="form-label" for="username">Username</label>
                        <input id="username" type="text" class="form-control form-control-lg" v-model="username"
                            autocomplete="username" required />
                    </div>

                    <div class="mb-3">
                        <label class="form-label" for="password">Password</label>
                        <input id="password" type="password" class="form-control form-control-lg" v-model="password"
                            autocomplete="current-password" required />
                    </div>

                    <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="isSubmitting">
                        {{ isSubmitting ? "Signing in..." : "Sign in" }}
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-portal {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top left, rgba(56, 133, 255, 0.15), transparent 35%),
        linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
    padding: 2rem 1rem;
    overflow: auto;
}

.login-card {
    width: 100%;
    max-width: 440px;
    border: none;
    border-radius: 1.5rem;
    overflow: hidden;
}

.card-body {
    background-color: rgba(255, 255, 255, 0.95);
}

.login-brand {
    width: 72px;
    height: 72px;
    font-size: 1.35rem;
}

.form-control {
    border-radius: 1rem;
}

.btn-primary {
    border-radius: 1rem;
}
</style>
