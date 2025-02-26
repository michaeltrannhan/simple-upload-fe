export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client-side
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  // Check for token in localStorage
  const token = localStorage.getItem('token');
  if (token) {
    authStore.token = token;
    authStore.isAuthenticated = true;
    try {
      await authStore.fetchProfile();
    } catch (error) {
      authStore.logout();
    }
  }
});