import axios from 'axios'

const API_BASE_URL = '/api/v1'

export const getOrders = async (status?: string) => {
  return axios.get(`${API_BASE_URL}/orders`, { params: { status } })
}

export const getNewOrderInfo = async (params: {
  trainNo: string
  departureStation: string
  arrivalStation: string
  departureDate: string
}) => {
  return axios.get(`${API_BASE_URL}/orders/new`, { params })
}

export const createOrder = async (orderData: any) => {
  return axios.post(`${API_BASE_URL}/orders`, orderData)
}

export const getOrderInfo = async (orderId: string) => {
  return axios.get(`${API_BASE_URL}/orders/${orderId}`)
}

export const cancelOrder = async (orderId: string) => {
  return axios.post(`${API_BASE_URL}/orders/${orderId}/cancel`)
}

export const payOrder = async (orderId: string) => {
  return axios.post(`${API_BASE_URL}/orders/${orderId}/pay`)
}

export const getPaymentInfo = async (orderId: string) => {
  return axios.get(`${API_BASE_URL}/orders/${orderId}/payment`)
}

export const getOrderTimeRemaining = async (orderId: string) => {
  return axios.get(`${API_BASE_URL}/orders/${orderId}/time-remaining`)
}
