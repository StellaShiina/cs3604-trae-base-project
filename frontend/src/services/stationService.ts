/**
 * 站点服务 - 处理站点查询和验证
 * 支持城市级查询
 */

const API_BASE_URL = 'http://localhost:3000/api';

export interface Station {
  stationName: string;
  pinyin?: string;
  shortPinyin?: string;
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
    const response = await fetch(`${API_BASE_URL}/stations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('获取站点列表失败');
    }

    const data = await response.json();
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
    const response = await fetch(`${API_BASE_URL}/stations?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('搜索站点失败');
    }

    const data = await response.json();
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
    const response = await fetch(`${API_BASE_URL}/stations/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stationName }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        valid: true,
        station: data.station,
      };
    } else {
      return {
        valid: false,
        error: data.error || '无法匹配该站点',
        suggestions: data.suggestions || [],
      };
    }
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
 */
export const getAllCities = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trains/cities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('获取城市列表失败');
    }

    const data = await response.json();
    return data.cities || [];
  } catch (error) {
    console.error('获取城市列表失败:', error);
    return [];
  }
};

/**
 * 根据城市名获取车站列表
 */
export const getStationsByCity = async (cityName: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trains/cities/${encodeURIComponent(cityName)}/stations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
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
      const stations = await getStationsByCity(cityName);
      return {
        valid: true,
        city: cityName,
        stations: stations,
      };
    } else {
      return {
        valid: false,
        error: '无法匹配该城市',
        suggestions: allCities,
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

/**
 * 根据车站名获取所属城市
 */
export const getCityByStation = async (stationName: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trains/stations/${encodeURIComponent(stationName)}/city`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.city || null;
  } catch (error) {
    console.error('获取车站所属城市失败:', error);
    return null;
  }
};

