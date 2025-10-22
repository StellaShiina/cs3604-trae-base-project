import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// TODO: Add router, store, and other plugins
// import { createRouter, createWebHistory } from 'vue-router'
// import { createPinia } from 'pinia'

// const router = createRouter({
//   history: createWebHistory(),
//   routes: []
// })

// const pinia = createPinia()

// app.use(router)
// app.use(pinia)

app.mount('#app')