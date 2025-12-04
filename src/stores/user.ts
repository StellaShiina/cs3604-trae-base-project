import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../services/authService'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => user.value !== null)

  function setUser(newUser: User) {
    user.value = newUser
  }

  function logout() {
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    setUser,
    logout
  }
})
