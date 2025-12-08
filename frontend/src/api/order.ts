import request from '../utils/request'

export interface Ticket {
  ticket_id: number
  passenger_name: string
  seat_type: string
  seat_no: string
  price: number
  status: string
}

export interface Order {
  orderId: string
  status: string
  trainNo: string
  fromStation: string
  toStation: string
  departTime: string
  arriveTime: string
  totalPrice: number
  tickets: Ticket[]
}

export const createOrder = (data: any) => {
  return request.post('/orders', data)
}

export const getOrders = (status?: string) => {
  return request.get<any, Order[]>('/orders', {
    params: { status }
  })
}

export const getOrderConfirmation = (orderId: string) => {
  return request.get(`/orders/${orderId}/confirmation`)
}

export const confirmOrder = (orderId: string) => {
  return request.post(`/orders/${orderId}/confirm`)
}

export const submitOrder = (data: any) => {
  return request.post('/orders/submit', data)
}

export const getOrderPageData = (params: any) => {
  return request.get('/orders/new', { params })
}

export const getPaymentData = (orderId: string) => {
  return request.get(`/payment/${orderId}`)
}

export const cancelOrder = (orderId: string) => {
  return request.post(`/payment/${orderId}/cancel`)
}

export const confirmPayment = (orderId: string) => {
  return request.post(`/payment/${orderId}/confirm`)
}

export const getTimeRemaining = (orderId: string) => {
  return request.get(`/payment/${orderId}/time-remaining`)
}

export const payOrder = (orderId: string) => {
  return request.post(`/orders/${orderId}/pay`)
}

// export const cancelOrder = (orderId: string) => {
//   return request.post(`/orders/${orderId}/cancel`)
// }

export const refundTicket = (ticketId: number) => {
  return request.post(`/tickets/${ticketId}/refund`)
}
