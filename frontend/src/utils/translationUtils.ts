export const seatTypeMap: Record<string, string> = {
  business: '商务座',
  first: '一等座',
  second: '二等座',
  softSleeper: '软卧',
  hardSleeper: '硬卧',
  hardSeat: '硬座',
  softSeat: '软座',
  noSeat: '无座',
  // Compatible with underscore format
  soft_sleeper: '软卧',
  hard_sleeper: '硬卧',
  hard_seat: '硬座',
  soft_seat: '软座',
  no_seat: '无座',
  // Case insensitive fallbacks
  Business: '商务座',
  First: '一等座',
  Second: '二等座',
  SoftSleeper: '软卧',
  HardSleeper: '硬卧',
  HardSeat: '硬座',
  SoftSeat: '软座',
  NoSeat: '无座'
};

export const ticketTypeMap: Record<string, string> = {
  adult: '成人票',
  child: '儿童票',
  student: '学生票',
  disability: '残军票',
  // Case insensitive fallbacks
  Adult: '成人票',
  Child: '儿童票',
  Student: '学生票',
  Disability: '残军票'
};

export const translateSeatType = (type: string): string => {
  if (!type) return '';
  return seatTypeMap[type] || type;
};

export const translateTicketType = (type: string): string => {
  if (!type) return '成人票';
  return ticketTypeMap[type] || type;
};
