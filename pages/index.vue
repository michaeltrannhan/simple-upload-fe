<template>
  <div v-if="!authStore.isAuthenticated">
    <v-tabs v-model="activeTab">
      <v-tab value="login">Login</v-tab>
      <v-tab value="register">Register</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="login">
        <v-form @submit.prevent="handleLogin" class="mt-4">
          <v-text-field
            v-model="loginForm.email"
            label="Email"
            type="email"
            required
          ></v-text-field>
          <v-text-field
            v-model="loginForm.password"
            label="Password"
            type="password"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block>Login</v-btn>
        </v-form>
      </v-window-item>

      <v-window-item value="register">
        <v-form @submit.prevent="handleRegister" class="mt-4">
          <v-text-field
            v-model="registerForm.username"
            label="Username"
            required
          ></v-text-field>
          <v-text-field
            v-model="registerForm.email"
            label="Email"
            type="email"
            required
          ></v-text-field>
          <v-text-field
            v-model="registerForm.password"
            label="Password"
            type="password"
            required
          ></v-text-field>
          <v-btn type="submit" color="primary" block>Register</v-btn>
        </v-form>
      </v-window-item>
    </v-window>
  </div>

  <div v-else>
    <v-card class="mb-4">
      <v-card-title>Upload Image</v-card-title>
      <v-card-text>
        <v-file-input
          v-model="fileInput"
          label="Choose file"
          accept="image/*"
          @update:model-value="handleFileChange"
          show-size
          prepend-icon="mdi-camera"
        ></v-file-input>

        <!-- Image Preview -->
        <div v-if="imagePreview" class="mb-4">
          <v-img
            :src="imagePreview"
            max-height="200"
            contain
            class="bg-grey-lighten-2 rounded"
          ></v-img>
        </div>

        <v-btn
          color="primary"
          @click="handleUpload"
          :loading="filesStore.loading"
          :disabled="!fileInput"
          prepend-icon="mdi-cloud-upload"
          class="mt-2"
        >
          Upload
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>My Files</v-card-title>
      <v-card-text>
        <v-list v-if="filesStore.files.length > 0">
          <v-list-item
            v-for="file in filesStore.files"
            :key="file.id"
            :title="file.originalname"
          >
            <template v-slot:prepend>
              <v-img
                :src="`https://simple-upload-sigma.vercel.app/api/files/public/${file.id}`"
                width="60"
                height="60"
                cover
                crossOrigin="anonymous"
                alt="My Image"
                class="rounded"
                @error="handleImageError(file.id)"
              >
                <template v-slot:placeholder>
                  <v-icon icon="mdi-image" size="30"></v-icon>
                </template>
              </v-img>
            </template>
            <template v-slot:append>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                @click="handleDelete(file.id)"
                :loading="deletingId === file.id"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
        <div v-else class="text-center py-4">
          <v-icon icon="mdi-image-off" size="48" color="grey"></v-icon>
          <div class="text-grey mt-2">No files uploaded yet</div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useFilesStore } from "~/stores/files";

const authStore = useAuthStore();
const filesStore = useFilesStore();
const snackbar = inject("snackbar");

const activeTab = ref("login");
const fileInput = ref<File | null>(null);
const deletingId = ref<string | null>(null);
const imagePreview = ref<string | null>(null);

const loginForm = reactive({
  email: "",
  password: "",
});

const registerForm = reactive({
  username: "",
  email: "",
  password: "",
});

function handleFileChange(file: File | null) {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    imagePreview.value = null;
  }
}

async function handleLogin() {
  try {
    await authStore.login(loginForm.email, loginForm.password);
    snackbar.text = "Login successful";
    snackbar.color = "success";
    snackbar.show = true;
    await filesStore.fetchFiles();
  } catch (error: any) {
    snackbar.text = error.message;
    snackbar.color = "error";
    snackbar.show = true;
  }
}

async function handleRegister() {
  try {
    await authStore.register(
      registerForm.username,
      registerForm.email,
      registerForm.password
    );
    snackbar.text = "Registration successful";
    snackbar.color = "success";
    snackbar.show = true;
    await filesStore.fetchFiles();
  } catch (error: any) {
    snackbar.text = error.message;
    snackbar.color = "error";
    snackbar.show = true;
  }
}

async function handleUpload() {
  if (!fileInput.value) return;

  try {
    await filesStore.uploadFile(fileInput.value);
    fileInput.value = null;
    imagePreview.value = null;
    snackbar.text = "File uploaded successfully";
    snackbar.color = "success";
    snackbar.show = true;
  } catch (error: any) {
    snackbar.text = error.message;
    snackbar.color = "error";
    snackbar.show = true;
  }
}

async function handleDelete(id: string) {
  try {
    deletingId.value = id;
    await filesStore.deleteFile(id);
    snackbar.text = "File deleted successfully";
    snackbar.color = "success";
    snackbar.show = true;
  } catch (error: any) {
    snackbar.text = error.message;
    snackbar.color = "error";
    snackbar.show = true;
  } finally {
    deletingId.value = null;
  }
}

function handleImageError(fileId: string) {
  console.error(`Failed to load image for file ID: ${fileId}`);
}

// Fetch files if user is authenticated
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await filesStore.fetchFiles();
  }
});
</script>
