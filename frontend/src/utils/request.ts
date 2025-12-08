import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api/v1', // Based on the backend logs: /api/v1/auth/register
  timeout: 10000
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const msg = error.response?.data?.error || error.message || 'Request Error'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service
