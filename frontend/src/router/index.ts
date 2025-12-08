import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/trains',
    name: 'TrainList',
    component: () => import('../views/TrainList.vue')
  },
  {
    path: '/order/create',
    name: 'OrderCreate',
    component: () => import('../views/OrderCreate.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'OrderList',
    component: () => import('../views/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/passengers',
    name: 'PassengerList',
    component: () => import('../views/PassengerList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/personal-info',
    name: 'PersonalInfo',
    component: () => import('../views/PersonalInfo.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payment/:orderId',
    name: 'Payment',
    component: () => import('../views/Payment.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/purchase-success/:orderId',
    name: 'SuccessfulPurchase',
    component: () => import('../views/SuccessfulPurchase.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  const token = localStorage.getItem('authToken')
  if (to.meta.requiresAuth && !token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
