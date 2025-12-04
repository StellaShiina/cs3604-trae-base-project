import axios from 'axios'

export interface TrainSeat {
  type: string
  left: number
  bookable: boolean
}

export interface Train {
  trainNo: string
  from: string
  to: string
  startTime: string
  endTime: string
  seats: TrainSeat[]
}

export const searchTrains = async (from: string, to: string, date: string): Promise<Train[]> => {
  const response = await axios.get('/api/v1/trains/search', {
    params: {
      fromStationId: from,
      toStationId: to,
      date: date
    }
  })
  return response.data
}
