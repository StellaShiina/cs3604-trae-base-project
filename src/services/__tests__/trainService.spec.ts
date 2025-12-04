import { describe, it, expect, vi } from 'vitest'
import { searchTrains } from '../trainService'
import axios from 'axios'

vi.mock('axios')

describe('trainService', () => {
  it('fetches trains with correct parameters', async () => {
    const mockData = [
      {
        trainNo: 'G1',
        from: 'Beijing',
        to: 'Shanghai',
        startTime: '09:00',
        endTime: '13:00',
        seats: [
          { type: 'second', left: 10, bookable: true },
          { type: 'first', left: 5, bookable: true }
        ]
      }
    ]

    // @ts-ignore
    axios.get.mockResolvedValue({ data: mockData })

    const result = await searchTrains('Beijing', 'Shanghai', '2023-10-01')

    expect(axios.get).toHaveBeenCalledWith('/api/v1/trains/search', {
      params: {
        fromStationId: 'Beijing',
        toStationId: 'Shanghai',
        date: '2023-10-01'
      }
    })
    expect(result).toEqual(mockData)
  })

  it('handles errors gracefully', async () => {
    // @ts-ignore
    axios.get.mockRejectedValue(new Error('Network Error'))

    await expect(searchTrains('Beijing', 'Shanghai', '2023-10-01')).rejects.toThrow('Network Error')
  })
})
