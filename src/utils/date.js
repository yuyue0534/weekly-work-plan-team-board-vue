export function startOfWeekMonday(date) {
  const copied = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copied.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copied.setDate(copied.getDate() + diff);
  return copied;
}

export function addDays(date, days) {
  const copied = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  copied.setDate(copied.getDate() + days);
  return copied;
}

export function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

export function formatTimestampForFile(date) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}_${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
}

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function buildWorkWeeks(year) {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);
  let start = startOfWeekMonday(firstDay);
  const weeks = [];
  let weekNo = 1;

  while (start <= lastDay) {
    const days = Array.from({ length: 5 }, (_, index) => addDays(start, index)).map(formatDate);
    const key = `${year}-W${pad2(weekNo)}`;
    weeks.push({
      key,
      weekNo,
      startDate: days[0],
      endDate: days[4],
      days,
      label: `week ${weekNo} ${days[0]} ~ ${days[4]}`
    });
    start = addDays(start, 7);
    weekNo += 1;
  }
  return weeks;
}

export function getDefaultWeekKey(year, weekOptions) {
  const today = new Date();
  if (today.getFullYear() !== Number(year)) return weekOptions[0]?.key || "";
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const match = weekOptions.find((week) => {
    const monday = parseDate(week.startDate);
    const sunday = addDays(monday, 6);
    return todayOnly >= monday && todayOnly <= sunday;
  });
  return match?.key || weekOptions[0]?.key || "";
}

export function normalizeYear(value) {
  const currentYear = new Date().getFullYear();
  const year = Number(value);
  if (!Number.isInteger(year)) return currentYear;
  return Math.min(2100, Math.max(2000, year));
}
