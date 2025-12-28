import axios from 'axios'
import { translateSeatType } from '@/utils/translation'

const API_BASE_URL = '/api/v1'

function calculateDuration(startTime: string, endTime: string): number {
  try {
    if (!startTime || !endTime) return 0
    const startParts = startTime.split(':').map(Number)
    const endParts = endTime.split(':').map(Number)
    
    if (startParts.length < 2 || endParts.length < 2) return 0

    const startH = startParts[0]
    const startM = startParts[1]
    const endH = endParts[0]
    const endM = endParts[1]

    if (startH === undefined || startM === undefined || endH === undefined || endM === undefined) return 0
    
    let duration = (endH * 60 + endM) - (startH * 60 + startM)
    if (duration < 0) {
      // Cross day, add 24 hours
      duration += 24 * 60
    }
    return duration
  } catch (e) {
    return 0
  }
}

export async function searchTrains(
  departureStation: string,
  arrivalStation: string,
  departureDate: string,
  trainTypes?: string[]
) {
  try {
    const params = new URLSearchParams({
      fromStationId: departureStation,
      toStationId: arrivalStation,
      date: departureDate
    })

    const response = await axios.get(`${API_BASE_URL}/trains/search?${params.toString()}`)
    const data = response.data
    const trainList = Array.isArray(data) ? data : ((data && data.trains) || [])

    const mappedTrains = trainList.map((t: any) => {
      const availableSeats: any = {}

      ;(t.seats || []).forEach((seat: any) => {
        const rawType = (seat && seat.type) ? String(seat.type) : ''
        const translated = translateSeatType(rawType)
        const zhType = (rawType === 'preferredFirst' || rawType === 'PreferredFirst' || rawType === 'preferred_first' || translated === '优选一等座')
          ? '一等座'
          : translated

        const left = typeof seat?.left === 'number' ? seat.left : 0
        availableSeats[zhType] = (availableSeats[zhType] || 0) + left
      })

      return {
        trainNo: t.trainNo,
        departureStation: t.from,
        arrivalStation: t.to,
        departureDate: departureDate,
        departureTime: t.startTime,
        arrivalTime: t.endTime,
        duration: calculateDuration(t.startTime, t.endTime),
        availableSeats: availableSeats,
        initialDepartureStation: t.initialDepartureStation, // New field
        finalArrivalStation: t.finalArrivalStation          // New field
      }
    })

    const filteredTrains = trainTypes && trainTypes.length > 0 
      ? mappedTrains.filter((t: any) => {
          const type = t.trainNo.charAt(0)
          return trainTypes.includes(type) || (trainTypes.includes('Other') && !['G','D','C'].includes(type))
        })
      : mappedTrains

    return filteredTrains
  } catch (error: any) {
    let errorMessage = '查询失败'
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage = error.response.data.error
    }
    throw new Error(errorMessage)
  }
}
