import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { getLocalDateString, getTodayString, getDateAfterDays, getWeekDay } from '../date'

describe('date utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Set a fixed date: 2023-10-01 (Sunday)
    // Note: Month is 0-indexed (0=Jan, 9=Oct)
    const date = new Date(2023, 9, 1) 
    vi.setSystemTime(date)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('getLocalDateString returns formatted date', () => {
    const date = new Date(2023, 0, 1) // 2023-01-01
    expect(getLocalDateString(date)).toBe('2023-01-01')
    
    // Test padding
    const date2 = new Date(2023, 0, 5)
    expect(getLocalDateString(date2)).toBe('2023-01-05')
  })

  it('getTodayString returns today string', () => {
    expect(getTodayString()).toBe('2023-10-01')
  })

  it('getDateAfterDays returns future date', () => {
    expect(getDateAfterDays(1)).toBe('2023-10-02')
    expect(getDateAfterDays(5)).toBe('2023-10-06')
  })

  it('getWeekDay returns correct weekday', () => {
    const date = new Date(2023, 9, 1) // Sunday
    expect(getWeekDay(date)).toBe('周日')
    
    const date2 = new Date(2023, 9, 2) // Monday
    expect(getWeekDay(date2)).toBe('周一')
  })
})
