import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css' // We will clean this file later

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restore session
const authStore = useAuthStore()
authStore.restoreSession()

app.mount('#app')
