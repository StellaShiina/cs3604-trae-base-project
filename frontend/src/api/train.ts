import request from '../utils/request'

export interface Train {
  trainNo: string
  from: string
  to: string
  startTime: string
  endTime: string
  seats: {
    type: string
    left: number
    bookable: boolean
    price: number
  }[]
}

export const searchTrains = (params: { from: string; to: string; date: string }) => {
  return request.get<any, Train[]>('/trains/search', {
    params: {
      fromStationId: params.from,
      toStationId: params.to,
      date: params.date
    }
  })
}
