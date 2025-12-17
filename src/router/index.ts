import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import SearchPage from '@/views/SearchPage.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import PersonalCenterView from '@/views/PersonalCenterView.vue'
import OrderView from '@/views/OrderView.vue'
import HomeView from '@/views/HomeView.vue'
import PaymentView from '@/views/PaymentView.vue'
import PurchaseSuccessView from '@/views/PurchaseSuccessView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/payment/:orderId',
    name: 'Payment',
    component: PaymentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/purchase-success/:orderId',
    name: 'PurchaseSuccess',
    component: PurchaseSuccessView,
    meta: { requiresAuth: true }
  },
  {
    path: '/personal-center',
    name: 'PersonalCenter',
    component: PersonalCenterView,
    meta: { requiresAuth: true }
  },
  {
    path: '/order',
    name: 'Order',
    component: OrderView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
