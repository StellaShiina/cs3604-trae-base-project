/**
 * 座位号格式化工具
 * 将数字座位号转换为实际车厢座位格式
 */

/**
 * 座位类型配置
 */
interface SeatConfig {
  seatsPerRow: number;
  letters: string[];
}

const SEAT_CONFIGS: { [key: string]: SeatConfig } = {
  '二等座': { seatsPerRow: 5, letters: ['A', 'B', 'C', 'D', 'F'] },
  '一等座': { seatsPerRow: 4, letters: ['A', 'C', 'D', 'F'] },
  '商务座': { seatsPerRow: 2, letters: ['A', 'F'] },
};

/**
 * 将原始座位号转换为格式化显示
 * @param seatNo 原始座位号（如 "01", "1-01" 中的 "01"）
 * @param seatType 席别类型
 * @returns 格式化后的座位号（如 "01A", "01号上铺"）
 */
export function formatSeatNumber(seatNo: string, seatType: string): string {
  // 提取纯数字部分
  const cleanSeatNo = seatNo.includes('-') ? seatNo.split('-')[1] : seatNo;
  const num = parseInt(cleanSeatNo, 10);
  
  if (isNaN(num)) {
    return seatNo; // 无法解析，返回原值
  }
  
  const config = SEAT_CONFIGS[seatType];
  
  if (config) {
    // 座位带字母的类型（二等座、一等座、商务座）
    const row = Math.ceil(num / config.seatsPerRow);
    const letterIndex = (num - 1) % config.seatsPerRow;
    const letter = config.letters[letterIndex];
    return `${row.toString().padStart(2, '0')}${letter}`;
  }
  
  // 软卧
  if (seatType === '软卧') {
    const berth = (num % 2 === 1) ? '上铺' : '下铺';
    return `${cleanSeatNo.padStart(2, '0')}号${berth}`;
  }
  
  // 硬卧 - 每3个座位对应一个号
  if (seatType === '硬卧') {
    const compartment = Math.ceil(num / 3);
    const berthIndex = ((num - 1) % 3);
    const berth = ['上铺', '中铺', '下铺'][berthIndex];
    return `${compartment.toString().padStart(2, '0')}号${berth}`;
  }
  
  // 未知类型，返回原值
  return cleanSeatNo.padStart(2, '0');
}

/**
 * 将完整的座位号（包含车厢号）转换为格式化显示
 * @param fullSeatNo 完整座位号（如 "1-01"）
 * @param seatType 席别类型
 * @returns 完整格式化显示（如 "01车01A号"）
 */
export function formatFullSeatNumber(fullSeatNo: string, seatType: string): string {
  if (!fullSeatNo) return '';
  
  // 解析车厢号和座位号
  let carNo: string;
  let seatNo: string;
  
  if (fullSeatNo.includes('-')) {
    const parts = fullSeatNo.split('-');
    carNo = parts[0];
    seatNo = parts[1];
  } else {
    // 如果没有车厢号，假设格式已经是处理过的
    return fullSeatNo;
  }
  
  const formattedSeat = formatSeatNumber(seatNo, seatType);
  return `${carNo.padStart(2, '0')}车${formattedSeat}号`;
}

/**
 * 将格式化的座位号解析回原始数字格式
 * @param formattedSeat 格式化的座位号（如 "01A", "01号上铺"）
 * @param seatType 席别类型
 * @returns 原始座位号（如 "01"）
 */
export function parseSeatNumber(formattedSeat: string, seatType: string): string {
  const config = SEAT_CONFIGS[seatType];
  
  if (config) {
    // 座位带字母的类型（二等座、一等座、商务座）
    const match = formattedSeat.match(/^(\d+)([A-F])$/);
    if (match) {
      const row = parseInt(match[1], 10);
      const letter = match[2];
      const letterIndex = config.letters.indexOf(letter);
      
      if (letterIndex >= 0) {
        const seatNum = (row - 1) * config.seatsPerRow + letterIndex + 1;
        return seatNum.toString().padStart(2, '0');
      }
    }
  }
  
  // 软卧
  if (seatType === '软卧') {
    const match = formattedSeat.match(/^(\d+)号(上铺|下铺)$/);
    if (match) {
      return match[1].padStart(2, '0');
    }
  }
  
  // 硬卧
  if (seatType === '硬卧') {
    const match = formattedSeat.match(/^(\d+)号(上铺|中铺|下铺)$/);
    if (match) {
      const compartment = parseInt(match[1], 10);
      const berth = match[2];
      const berthIndex = ['上铺', '中铺', '下铺'].indexOf(berth);
      
      if (berthIndex >= 0) {
        const seatNum = (compartment - 1) * 3 + berthIndex + 1;
        return seatNum.toString().padStart(2, '0');
      }
    }
  }
  
  // 无法解析，返回原值
  return formattedSeat;
}

/**
 * 将完整格式化座位号解析回原始格式
 * @param fullFormatted 完整格式化座位号（如 "01车01A号"）
 * @param seatType 席别类型
 * @returns 原始完整座位号（如 "1-01"）
 */
export function parseFullSeatNumber(fullFormatted: string, seatType: string): string {
  const match = fullFormatted.match(/^(\d+)车(.+)号$/);
  if (!match) return fullFormatted;
  
  const carNo = parseInt(match[1], 10).toString();
  const formattedSeat = match[2];
  const seatNo = parseSeatNumber(formattedSeat, seatType);
  
  return `${carNo}-${seatNo}`;
}

/**
 * 格式化座位信息用于订单显示
 * 兼容旧格式和新格式
 * @param seatNumber 座位号（可能是 "1-01" 或已格式化的）
 * @param carNumber 车厢号（可选）
 * @param seatType 席别类型
 * @returns 格式化的完整座位信息
 */
export function formatSeatInfoForDisplay(
  seatNumber: string | null | undefined,
  carNumber: string | number | null | undefined,
  seatType: string
): string {
  if (!seatNumber) {
    if (carNumber) {
      return `${String(carNumber).padStart(2, '0')}车`;
    }
    return '待分配';
  }
  
  // 如果座位号包含车厢信息（如 "1-01"）
  if (seatNumber.includes('-')) {
    return formatFullSeatNumber(seatNumber, seatType);
  }
  
  // 如果有独立的车厢号
  if (carNumber) {
    const formattedSeat = formatSeatNumber(seatNumber, seatType);
    return `${String(carNumber).padStart(2, '0')}车${formattedSeat}号`;
  }
  
  // 只有座位号，没有车厢号
  const formattedSeat = formatSeatNumber(seatNumber, seatType);
  return `${formattedSeat}号`;
}

export default {
  formatSeatNumber,
  formatFullSeatNumber,
  parseSeatNumber,
  parseFullSeatNumber,
  formatSeatInfoForDisplay,
};

