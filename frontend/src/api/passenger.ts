import axios from 'axios'

const API_BASE_URL = '/api/v1'

export interface Passenger {
  id?: string
  name: string
  card_type: string
  card_no: string
  phone?: string
  passenger_type?: string // For response
  is_default?: boolean
  type?: string // For request
}

export const getPassengers = async (params?: { name?: string }) => {
  const name = params?.name?.trim()
  return axios.get(`${API_BASE_URL}/passengers`, {
    params: name ? { name } : undefined
  })
}

export const addPassenger = async (passenger: Passenger) => {
  return axios.post(`${API_BASE_URL}/passengers`, passenger)
}

export const updatePassenger = async (id: string, passenger: Passenger) => {
  return axios.put(`${API_BASE_URL}/passengers/${id}`, passenger)
}

export const deletePassenger = async (id: string) => {
  return axios.delete(`${API_BASE_URL}/passengers/${id}`)
}
