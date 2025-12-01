import { createApp, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { RouterView } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import BookingPage from './pages/BookingPage.vue'
import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import DiningSearchPage from './pages/DiningSearchPage.vue'
import DiningMerchantsPage from './pages/DiningMerchantsPage.vue'
import DiningMerchantDetailPage from './pages/DiningMerchantDetailPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/booking', component: BookingPage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/dining/search', component: DiningSearchPage },
    { path: '/dining/merchants', component: DiningMerchantsPage },
    { path: '/dining/merchants/:id', component: DiningMerchantDetailPage },
  ],
})

createApp({ render: () => h(RouterView) }).use(router).mount('#app')
