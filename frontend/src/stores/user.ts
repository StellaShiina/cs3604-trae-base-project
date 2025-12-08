import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('authToken') || '')
  const user = ref<any>(null)
  const isLoggedIn = computed(() => !!token.value)
  const username = computed(() => user.value?.username || localStorage.getItem('username') || '')

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('authToken', newToken)
  }

  function setUser(userInfo: any) {
    user.value = userInfo
    // Optional: persist user info if needed, or rely on individual fields
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
  }

  return { token, user, isLoggedIn, username, setToken, setUser, logout }
})
