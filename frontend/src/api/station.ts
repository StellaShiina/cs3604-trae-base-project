/**
 * 站点服务 - 处理站点查询和验证
 * 支持城市级查询
 */
import request from '../utils/request'

export interface Station {
  id: string;
  code: string;
  name_en: string;
  name_zh: string;
}

export interface ValidationResult {
  valid: boolean;
  station?: Station;
  error?: string;
  suggestions?: Station[];
}

export interface CityValidationResult {
  valid: boolean;
  city?: string;
  stations?: string[];
  error?: string;
  suggestions?: string[];
}

/**
 * 获取所有站点列表
 */
export const getAllStations = async (): Promise<Station[]> => {
  try {
    // Ideally this endpoint should exist
    const data: any = await request.get('/stations');
    return data.stations || [];
  } catch (error) {
    console.error('获取站点列表失败:', error);
    return [];
  }
};

/**
 * 搜索站点 (支持简拼、全拼、汉字)
 */
export const searchStations = async (keyword: string): Promise<Station[]> => {
  try {
    const data: any = await request.get('/stations', { params: { keyword } });
    return data.stations || [];
  } catch (error) {
    console.error('搜索站点失败:', error);
    return [];
  }
};

/**
 * 验证站点是否有效
 */
export const validateStation = async (stationName: string): Promise<ValidationResult> => {
  try {
    const data: any = await request.post('/stations/validate', { stationName });
    return {
      valid: true,
      station: data.station,
    };
  } catch (error) {
    console.error('验证站点失败:', error);
    return {
      valid: false,
      error: '验证站点失败，请稍后重试',
      suggestions: [],
    };
  }
};

/**
 * 获取所有支持的城市列表
 * 目前后端没有这个接口，暂时模拟一些常用城市，或者后续添加后端接口
 */
export const getAllCities = async (): Promise<string[]> => {
  try {
    // If backend doesn't support this yet, we might want to return a static list or fail gracefully
    // For now, let's try to call the API, and if it fails (404), return a static list?
    // But `request.ts` shows error messages.
    // Let's assume we will add the endpoint.
    const data: any = await request.get('/trains/cities');
    return data.cities || [];
  } catch (error) {
    console.error('获取城市列表失败:', error);
    // Fallback for development if backend is not ready
    return ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '长沙', '成都', '重庆', '西安', '郑州'];
  }
};

/**
 * 根据城市名获取车站列表
 */
export const getStationsByCity = async (cityName: string): Promise<string[]> => {
  try {
    const data: any = await request.get(`/trains/cities/${encodeURIComponent(cityName)}/stations`);
    return data.stations || [];
  } catch (error) {
    console.error('获取城市车站列表失败:', error);
    return [];
  }
};

/**
 * 验证城市是否有效
 */
export const validateCity = async (cityName: string): Promise<CityValidationResult> => {
  try {
    const allCities = await getAllCities();
    
    if (allCities.includes(cityName)) {
      // If valid, try to get stations
      try {
          const stations = await getStationsByCity(cityName);
          return {
            valid: true,
            city: cityName,
            stations: stations,
          };
      } catch {
          // If getting stations fails, still consider city valid but with empty stations
          return {
              valid: true,
              city: cityName,
              stations: []
          }
      }
    } else {
      return {
        valid: false,
        error: '无法匹配该城市',
        suggestions: allCities.filter(c => c.includes(cityName)),
      };
    }
  } catch (error) {
    console.error('验证城市失败:', error);
    return {
      valid: false,
      error: '验证城市失败，请稍后重试',
      suggestions: [],
    };
  }
};

export const getCityByStation = async (stationName: string): Promise<string> => {
  try {
    const response = await request.get(`/trains/stations/${encodeURIComponent(stationName)}/city`);
    return (response as any).city || stationName;
  } catch (error) {
    console.error('获取车站所属城市失败:', error);
    return stationName;
  }
};
