import request from '../utils/request'

export interface Station {
  stationName: string
  pinyin?: string
  shortPinyin?: string
}

export const getAllStations = async () => {
  return request.get('/stations')
}

export const searchStations = async (keyword: string) => {
  return request.get('/stations', {
    params: { keyword }
  })
}

export const validateStation = async (stationName: string) => {
  return request.post('/stations/validate', { stationName })
}
