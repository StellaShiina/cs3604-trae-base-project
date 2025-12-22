import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem('authToken'));
  
  const isAuthenticated = computed(() => !!token.value);
  
  const login = (newToken: string, userData: any) => {
    token.value = newToken;
    user.value = userData;
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };
  
  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
  };
  
  const restoreSession = () => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      token.value = storedToken;
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser);
        } catch (e) {
          console.error('Failed to parse user info', e);
        }
      }
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    restoreSession
  };
});
