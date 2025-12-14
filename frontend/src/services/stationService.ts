/**
 * 站点服务 - 处理站点查询和验证
 * 支持城市级查询
 */

import { API_BASE_URL } from '../config';

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
    const stations = data.stations || [];
    
    // 映射后端数据模型到前端模型
    return stations.map((s: any) => ({
      stationName: s.name_zh,
      pinyin: s.name_en,
      shortPinyin: s.code
    }));
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
    // 后端支持 ?q=keyword
    const response = await fetch(`${API_BASE_URL}/stations?q=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('搜索站点失败');
    }

    const data = await response.json();
    const stations = data.stations || [];
    
    return stations.map((s: any) => ({
      stationName: s.name_zh,
      pinyin: s.name_en,
      shortPinyin: s.code
    }));
  } catch (error) {
    console.error('搜索站点失败:', error);
    return [];
  }
};

/**
 * 验证站点是否有效
 * 由于后端没有专门的validate接口，我们在前端通过搜索来验证
 */
export const validateStation = async (stationName: string): Promise<ValidationResult> => {
  try {
    // 精确匹配
    const stations = await searchStations(stationName);
    const exactMatch = stations.find(s => s.stationName === stationName);

    if (exactMatch) {
      return {
        valid: true,
        station: exactMatch,
      };
    } else {
      return {
        valid: false,
        error: '无法匹配该站点',
        suggestions: stations,
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
 * 目前后端将站点作为城市处理
 */
export const getAllCities = async (): Promise<string[]> => {
  try {
    const stations = await getAllStations();
    // 提取所有站点名称作为城市列表
    return stations.map(s => s.stationName);
  } catch (error) {
    console.error('获取城市列表失败:', error);
    return [];
  }
};

/**
 * 根据城市名获取车站列表
 * 目前后端没有城市-车站的层级关系，直接返回该城市（站点）本身
 */
export const getStationsByCity = async (cityName: string): Promise<string[]> => {
  try {
    // 验证该城市（站点）是否存在
    const validation = await validateStation(cityName);
    if (validation.valid) {
      return [cityName];
    }
    return [];
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
      return {
        valid: true,
        city: cityName,
        stations: [cityName],
      };
    } else {
      // 尝试模糊匹配作为建议
      const suggestions = allCities.filter(c => c.includes(cityName)).slice(0, 5);
      return {
        valid: false,
        error: '无法匹配该城市',
        suggestions: suggestions,
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
 * 目前城市即车站
 */
export const getCityByStation = async (stationName: string): Promise<string | null> => {
  const validation = await validateStation(stationName);
  return validation.valid ? stationName : null;
};
