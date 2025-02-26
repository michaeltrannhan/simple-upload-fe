import { defineStore } from 'pinia';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const config = useRuntimeConfig();
        const response = await $fetch(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: { email, password }
        });

        this.token = response.token;
        this.user = response.user;
        this.isAuthenticated = true;

        // Store token in localStorage (only in browser)
        if (process.client) {
          localStorage.setItem('token', response.token);
        }
        
        return response;
      } catch (error: any) {
        const message = error.data?.message || error.message || 'Login failed';
        throw new Error(message);
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        const config = useRuntimeConfig();
        const response = await $fetch(`${config.public.apiBase}/auth/register`, {
          method: 'POST',
          body: { username, email, password }
        });

        this.token = response.token;
        this.user = response.user;
        this.isAuthenticated = true;

        // Store token in localStorage (only in browser)
        if (process.client) {
          localStorage.setItem('token', response.token);
        }
        
        return response;
      } catch (error: any) {
        const message = error.data?.message || error.message || 'Registration failed';
        throw new Error(message);
      }
    },

    async fetchProfile() {
      try {
        const config = useRuntimeConfig();
        const response = await $fetch(`${config.public.apiBase}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        this.user = response.user;
        return response;
      } catch (error: any) {
        const message = error.data?.message || error.message || 'Failed to fetch profile';
        throw new Error(message);
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      if (process.client) {
        localStorage.removeItem('token');
      }
    }
  }
});