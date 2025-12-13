import request from '../utils/request'

export interface TrainSearchParams {
  departureStation: string
  arrivalStation: string
  departureDate: string
  trainTypes?: string[]
}

export interface Train {
  trainNo: string
  startStation: string
  endStation: string
  fromStation: string
  toStation: string
  startTime: string
  endTime: string
  duration: string
  seatTypes: {
    type: string
    price: number
    count: number
  }[]
}

export const searchTrains = async (
  departureStation: string,
  arrivalStation: string,
  departureDate: string,
  trainTypes: string[] = []
) => {
  return request.post('/trains/search', {
    departureStation,
    arrivalStation,
    departureDate,
    trainTypes
  })
}

export const getTrainDetails = async (trainNo: string) => {
  return request.get(`/trains/${trainNo}`)
}
