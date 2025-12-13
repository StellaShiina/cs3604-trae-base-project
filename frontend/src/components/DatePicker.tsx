import React, { useState, useEffect, useRef } from 'react';
import './DatePicker.css';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate: string;
  maxDate: string;
  disabled?: boolean;
}

/**
 * 日期选择器组件
 * 完整实现：显示完整日历，14天内可点击，14天外灰色不可点击
 */
const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, minDate, maxDate, disabled = false }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  // 计算可选日期范围（优先使用传入的 minDate 和 maxDate props）
  const getSelectableRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 处理最小日期：如果传入了 minDate，使用它；否则使用今天（向后兼容）
    let min: Date;
    if (minDate && minDate.trim() !== '') {
      min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
    } else {
      min = today;
    }
    
    // 处理最大日期：如果传入了 maxDate 且不为空，使用它；否则使用今天+14天（向后兼容，15天内）
    let max: Date;
    if (maxDate && maxDate.trim() !== '') {
      max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
    } else {
      // 默认：今天起15天
      max = new Date(today);
      max.setDate(today.getDate() + 14);
    }
    
    return { min, max };
  };

  // 格式化日期为 YYYY-MM-DD 字符串（使用本地时区）
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 格式化日期显示
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 ${weekday}`;
  };

  // 点击外部关闭日历
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // 生成日历数据
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 获取当月第一天是星期几（0-6）
    const firstDay = new Date(year, month, 1).getDay();
    
    // 获取当月有多少天
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 获取上个月有多少天
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: Array<{
      date: Date;
      dateStr: string;
      day: number;
      isCurrentMonth: boolean;
      isSelectable: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];
    
    const { min, max } = getSelectableRange();
    const selectedDate = value ? new Date(value) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 填充上个月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      const dateStr = formatDateString(date);
      days.push({
        date,
        dateStr,
        day,
        isCurrentMonth: false,
        isSelectable: date >= min && date <= max,
        isSelected: selectedDate ? dateStr === value : false,
        isToday: dateStr === formatDateString(today)
      });
    }
    
    // 填充当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateString(date);
      days.push({
        date,
        dateStr,
        day,
        isCurrentMonth: true,
        isSelectable: date >= min && date <= max,
        isSelected: selectedDate ? dateStr === value : false,
        isToday: dateStr === formatDateString(today)
      });
    }
    
    // 填充下个月的日期（补满6行）
    const remainingDays = 42 - days.length; // 6行 × 7列 = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = formatDateString(date);
      days.push({
        date,
        dateStr,
        day,
        isCurrentMonth: false,
        isSelectable: date >= min && date <= max,
        isSelected: selectedDate ? dateStr === value : false,
        isToday: dateStr === formatDateString(today)
      });
    }
    
    return days;
  };

  // 处理日期选择
  const handleDateClick = (dateStr: string, isSelectable: boolean) => {
    if (isSelectable && !disabled) {
      onChange(dateStr);
      setShowCalendar(false);
    }
  };

  // 上一个月
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // 下一个月
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // 回到今天所在的月份
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onChange(formatDateString(today));
  };

  const calendarDays = generateCalendar();
  const monthYear = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`;

  return (
    <div className="date-picker" ref={calendarRef}>
      <input
        type="text"
        value={formatDisplayDate(value)}
        readOnly
        disabled={disabled}
        placeholder="请选择日期"
        onClick={() => !disabled && setShowCalendar(!showCalendar)}
        className={`date-input ${disabled ? 'disabled' : ''}`}
      />
      {/* 日历图标 */}
      <svg className="calendar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="5" y1="1" x2="5" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="11" y1="1" x2="11" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {showCalendar && !disabled && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={handlePrevMonth} type="button">
              ‹
            </button>
            <div className="calendar-month-year">{monthYear}</div>
            <button className="calendar-nav-btn" onClick={handleNextMonth} type="button">
              ›
            </button>
          </div>
          <div className="calendar-weekdays">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <div key={index} className="calendar-weekday">{day}</div>
            ))}
          </div>
          <div className="calendar-days">
            {calendarDays.map((dayInfo, index) => (
              <div
                key={index}
                className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${dayInfo.isSelected ? 'selected' : ''} ${dayInfo.isToday ? 'today' : ''} ${dayInfo.isSelectable ? 'selectable' : 'disabled'}`}
                onClick={() => handleDateClick(dayInfo.dateStr, dayInfo.isSelectable)}
              >
                {dayInfo.day}
              </div>
            ))}
          </div>
          <div className="calendar-footer">
            <button className="calendar-today-btn" onClick={handleToday} type="button">
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

