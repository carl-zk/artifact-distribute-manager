<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

</script>

<template>
    <div class="not-found">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>

        <!-- Authenticated users see different message -->
        <a v-if="auth.isAuthenticated" href="/tasks" class="btn btn-primary">
            Go to Dashboard
        </a>

        <a v-else href="/login" class="btn btn-primary">
            Sign In
        </a>
    </div>
</template>

<style scoped>
.not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
}
</style>