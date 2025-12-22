import axios from 'axios'

const API_BASE_URL = '/api/v1'

export interface Station {
  stationName: string
  pinyin?: string
  shortPinyin?: string
}

export interface ValidationResult {
  valid: boolean
  station?: Station
  error?: string
  suggestions?: Station[]
}

export interface CityValidationResult {
  valid: boolean
  city?: string
  stations?: string[]
  error?: string
  suggestions?: string[]
}

export const getAllStations = async (): Promise<Station[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stations`)
    const stations = response.data.stations || []
    
    // Map backend data to frontend model
    return stations.map((s: any) => ({
      stationName: s.name_zh,
      pinyin: s.name_en,
      shortPinyin: s.code
    }))
  } catch (error) {
    console.error('获取站点列表失败:', error)
    return []
  }
}

export const searchStations = async (keyword: string): Promise<Station[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stations`, {
      params: { q: keyword }
    })
    const stations = response.data.stations || []
    
    return stations.map((s: any) => ({
      stationName: s.name_zh,
      pinyin: s.name_en,
      shortPinyin: s.code
    }))
  } catch (error) {
    console.error('搜索站点失败:', error)
    return []
  }
}

export const validateStation = async (stationName: string): Promise<ValidationResult> => {
  try {
    const stations = await searchStations(stationName)
    const exactMatch = stations.find(s => s.stationName === stationName)
    
    if (exactMatch) {
      return {
        valid: true,
        station: exactMatch
      }
    } else {
      return {
        valid: false,
        error: '无法匹配该站点',
        suggestions: stations
      }
    }
  } catch (error) {
    console.error('验证站点失败:', error)
    return {
      valid: false,
      error: '验证站点失败，请稍后重试',
      suggestions: []
    }
  }
}

export const getAllCities = async (): Promise<string[]> => {
  try {
    const stations = await getAllStations()
    return stations.map(s => s.stationName)
  } catch (error) {
    console.error('获取城市列表失败:', error)
    return []
  }
}

export const getStationsByCity = async (cityName: string): Promise<string[]> => {
  try {
    const validation = await validateStation(cityName)
    if (validation.valid) {
      return [cityName]
    }
    return []
  } catch (error) {
    console.error('获取城市车站列表失败:', error)
    return []
  }
}

export const validateCity = async (cityName: string): Promise<CityValidationResult> => {
  try {
    const allCities = await getAllCities()
    
    if (allCities.includes(cityName)) {
      return {
        valid: true,
        city: cityName,
        stations: [cityName]
      }
    } else {
      const suggestions = allCities.filter(c => c.includes(cityName)).slice(0, 5)
      return {
        valid: false,
        error: '无法匹配该城市',
        suggestions: suggestions
      }
    }
  } catch (error) {
    console.error('验证城市失败:', error)
    return {
      valid: false,
      error: '验证城市失败，请稍后重试',
      suggestions: []
    }
  }
}

export const getCityByStation = async (stationName: string): Promise<string | null> => {
  const validation = await validateStation(stationName)
  return validation.valid ? stationName : null
}
