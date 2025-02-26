<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>Image Upload App</v-app-bar-title>
      <v-spacer></v-spacer>
      <template v-if="authStore.isAuthenticated">
        <v-btn @click="authStore.logout">Logout</v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container>
        <NuxtPage />
      </v-container>
    </v-main>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

// Global snackbar state
const snackbar = reactive({
  show: false,
  text: '',
  color: 'success'
});

// Provide snackbar to all components
provide('snackbar', snackbar);
</script>