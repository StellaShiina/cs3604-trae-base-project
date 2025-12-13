import { render } from '@testing-library/vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import router from '@/router'

export function renderWithPlugins(component: any, options = {}) {
  const pinia = createPinia()
  
  return render(component, {
    global: {
      plugins: [router, pinia, ElementPlus],
      ...options
    }
  })
}
