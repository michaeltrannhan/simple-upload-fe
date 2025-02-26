import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

interface File {
  id: string;
  filename: string;
  originalname: string;
  contentType: string;
  size: number;
  uploadDate: string;
}

interface FilesState {
  files: File[];
  loading: boolean;
}

export const useFilesStore = defineStore('files', {
  state: (): FilesState => ({
    files: [],
    loading: false
  }),

  actions: {
    async uploadFile(file: File) {
      try {
        this.loading = true;
        const config = useRuntimeConfig();
        const authStore = useAuthStore();
        const formData = new FormData();
        formData.append('file', file);

        const response = await $fetch(`${config.public.apiBase}/files/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        });

        await this.fetchFiles();
        return response;
      } catch (error: any) {
        const message = error.data?.message || error.message || 'Upload failed';
        throw new Error(message);
      } finally {
        this.loading = false;
      }
    },

    async fetchFiles() {
      try {
        this.loading = true;
        const config = useRuntimeConfig();
        const authStore = useAuthStore();
        const response = await $fetch(`${config.public.apiBase}/files`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        });

        this.files = response.files;
        return response;
      } catch (error: any) {
        const message = error.data?.message || error.message || 'Failed to fetch files';
        throw new Error(message);
      } finally {
        this.loading = false;
      }
    },

    async deleteFile(id: string) {
      try {
        this.loading = true;
        const config = useRuntimeConfig();
        const authStore = useAuthStore();
        await $fetch(`${config.public.apiBase}/files/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        });

        this.files = this.files.filter(file => file.id !== id);
      } catch (error: any) {
        const message = error.data?.message || error.message || 'Failed to delete file';
        throw new Error(message);
      } finally {
        this.loading = false;
      }
    }
  }
});