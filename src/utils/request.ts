import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8081/api/v1',
  timeout: 5000
})

// Request interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle global errors here
    return Promise.reject(error)
  }
)

export default request
