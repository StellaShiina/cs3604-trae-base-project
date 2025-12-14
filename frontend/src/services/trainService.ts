/**
 * 车次服务 - 封装车次相关的API调用
 */

import { API_BASE_URL } from '../config';
import { translateSeatType } from '../utils/translationUtils';

/**
 * 计算历时（分钟）
 */
function calculateDuration(startTime: string, endTime: string): number {
  try {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let duration = (endH * 60 + endM) - (startH * 60 + startM);
    if (duration < 0) {
      // 跨天，加24小时
      duration += 24 * 60;
    }
    return duration;
  } catch (e) {
    return 0;
  }
}

/**
 * 搜索车次
 * @param departureStation 出发站
 * @param arrivalStation 到达站
 * @param departureDate 出发日期
 * @param trainTypes 车次类型（可选）
 */
export async function searchTrains(
  departureStation: string,
  arrivalStation: string,
  departureDate: string,
  trainTypes?: string[]
) {
  try {
    // 构建查询参数
    const params = new URLSearchParams({
      fromStationId: departureStation, // 后端目前支持直接传站点名称
      toStationId: arrivalStation,
      date: departureDate
    });

    const response = await fetch(`${API_BASE_URL}/trains/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 尝试解析错误信息，如果解析失败则使用默认信息
      let errorMessage = '查询失败';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // 忽略 JSON 解析错误，使用状态文本
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // 后端直接返回数组，需要转换为前端期望的格式
    // 如果没有数据，后端可能返回 null，这里需要处理
    const trainList = Array.isArray(data) ? data : ((data && data.trains) || []);

    const mappedTrains = trainList.map((t: any) => {
      // 转换座位信息为 Map 格式，并将英文类型映射为中文
      const availableSeats: any = {};

      (t.seats || []).forEach((seat: any) => {
        const zhType = translateSeatType(seat.type);
        availableSeats[zhType] = seat.left;
      });

      return {
        trainNo: t.trainNo,
        departureStation: t.from,
        arrivalStation: t.to,
        departureDate: departureDate, // 使用查询日期
        departureTime: t.startTime,
        arrivalTime: t.endTime,
        duration: calculateDuration(t.startTime, t.endTime),
        availableSeats: availableSeats,
        // 其他字段如有需要可以在此添加
      };
    });

    // 客户端过滤车次类型
    const filteredTrains = trainTypes && trainTypes.length > 0 
      ? mappedTrains.filter((t: any) => {
          const type = t.trainNo.charAt(0);
          return trainTypes.includes(type) || (trainTypes.includes('Other') && !['G','D','C'].includes(type));
        })
      : mappedTrains;

    return {
      success: true,
      trains: filteredTrains,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('搜索车次失败:', error);
    return {
      success: false,
      error: error.message || '查询失败，请稍后重试',
      trains: [],
    };
  }
}

/**
 * 获取车次详情
 * @param trainNo 车次号
 */
export async function getTrainDetails(trainNo: string) {
  try {
    const response = await fetch(`/api/trains/${trainNo}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取车次详情失败');
    }

    const data = await response.json();
    return {
      success: true,
      train: data,
    };
  } catch (error: any) {
    console.error('获取车次详情失败:', error);
    return {
      success: false,
      error: error.message || '获取车次详情失败',
      train: null,
    };
  }
}

/**
 * 获取筛选选项
 * @param departureStation 出发站
 * @param arrivalStation 到达站
 * @param departureDate 出发日期
 */
export async function getFilterOptions(
  departureStation: string,
  arrivalStation: string,
  departureDate: string
) {
  try {
    const response = await fetch(
      `/api/trains/filter-options?departureStation=${encodeURIComponent(
        departureStation
      )}&arrivalStation=${encodeURIComponent(
        arrivalStation
      )}&departureDate=${departureDate}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取筛选选项失败');
    }

    const data = await response.json();
    return {
      success: true,
      options: data,
    };
  } catch (error: any) {
    console.error('获取筛选选项失败:', error);
    return {
      success: false,
      error: error.message || '获取筛选选项失败',
      options: {
        departureStations: [],
        arrivalStations: [],
        seatTypes: [],
      },
    };
  }
}

/**
 * 计算余票数
 * @param trainNo 车次号
 * @param departureStation 出发站
 * @param arrivalStation 到达站
 * @param departureDate 出发日期
 */
export async function calculateAvailableSeats(
  trainNo: string,
  departureStation: string,
  arrivalStation: string,
  departureDate: string
) {
  try {
    const response = await fetch('/api/trains/available-seats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trainNo,
        departureStation,
        arrivalStation,
        departureDate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '计算余票失败');
    }

    const data = await response.json();
    return {
      success: true,
      availableSeats: data.availableSeats,
    };
  } catch (error: any) {
    console.error('计算余票失败:', error);
    return {
      success: false,
      error: error.message || '计算余票失败',
      availableSeats: {},
    };
  }
}

/**
 * 获取可选日期列表
 */
export async function getAvailableDates() {
  try {
    const response = await fetch('/api/trains/available-dates');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取可选日期失败');
    }

    const data = await response.json();
    return {
      success: true,
      availableDates: data.availableDates || [],
      currentDate: data.currentDate,
    };
  } catch (error: any) {
    console.error('获取可选日期失败:', error);
    return {
      success: false,
      error: error.message || '获取可选日期失败',
      availableDates: [],
      currentDate: new Date().toISOString().split('T')[0],
    };
  }
}

