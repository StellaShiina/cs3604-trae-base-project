import request from '../utils/request'

export interface Passenger {
  id: string
  name: string
  card_type: string
  card_no: string
  type: string
}

export interface AddPassengerRequest {
  name: string
  card_type: string
  card_no: string
  type: string
}

export const getPassengers = async () => {
  const res = await request.get<any, any[]>('/passengers')
  return res.map(p => ({
    id: p.ID || p.id,
    name: p.Name || p.name,
    card_type: p.CardType || p.card_type || 'id_card',
    card_no: p.CardNo || p.card_no || p.id_no,
    type: p.PassengerType || p.type || 'adult'
  }))
}

export const addPassenger = (data: AddPassengerRequest) => {
  return request.post('/passengers', data)
}

export const updatePassenger = (id: string, data: AddPassengerRequest) => {
  return request.put(`/passengers/${id}`, data)
}

export const deletePassenger = (id: string) => {
  return request.delete(`/passengers/${id}`)
}
