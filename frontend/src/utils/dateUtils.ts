/**
 * 日期工具函数
 * 统一使用本地时间，避免时区问题
 */

/**
 * 获取本地日期的 YYYY-MM-DD 格式字符串
 * @param date - 可选的 Date 对象，默认为当前时间
 * @returns YYYY-MM-DD 格式的日期字符串
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 获取今天的日期字符串
 */
export const getTodayString = (): string => {
  return getLocalDateString(new Date());
};

/**
 * 获取N天后的日期字符串
 * @param days - 天数
 */
export const getDateAfterDays = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
};

