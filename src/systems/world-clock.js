export class WorldClock {
  constructor({ startDay = 1, startHour = 8, startMinute = 0, minutesPerSecond = 1 } = {}) {
    this.day = startDay;
    this.minuteOfDay = clampMinute(startHour * 60 + startMinute);
    this.minutesPerSecond = minutesPerSecond;
    this.carry = 0;
    this.eventCursor = `${this.day}:${this.minuteOfDay}`;
  }

  update(dt) {
    this.carry += Math.max(0, dt) * this.minutesPerSecond;
    const wholeMinutes = Math.floor(this.carry);
    if (wholeMinutes <= 0) return false;
    this.carry -= wholeMinutes;
    this.advanceMinutes(wholeMinutes);
    return true;
  }

  advanceMinutes(minutes) {
    const total = (this.day - 1) * 1440 + this.minuteOfDay + minutes;
    this.day = Math.floor(total / 1440) + 1;
    this.minuteOfDay = ((total % 1440) + 1440) % 1440;
  }

  snapshot() {
    const phase = phaseForMinute(this.minuteOfDay);
    const hour = Math.floor(this.minuteOfDay / 60);
    const minute = this.minuteOfDay % 60;
    return {
      day: this.day,
      minuteOfDay: this.minuteOfDay,
      hour,
      minute,
      timeText: `${pad(hour)}:${pad(minute)}`,
      dayLabel: `DAY ${String(this.day).padStart(2, "0")}`,
      turnLabel: `TURN ${String(this.day).padStart(2, "0")}`,
      phaseKey: phase.key,
      phaseLabel: phase.label,
      overlayColor: phase.overlayColor,
      overlayAlpha: phase.overlayAlpha,
      eventKey: `${this.day}:${this.minuteOfDay}`
    };
  }
}

export const repeatingTimeEvents = [
  { id: "morning-news", minuteOfDay: 480, label: "아침 뉴스 갱신", target: "internet.news" },
  { id: "lunch-crowd", minuteOfDay: 720, label: "점심 유동 인구 증가", target: "npc.schedule" },
  { id: "casino-peak", minuteOfDay: 1140, label: "카지노 피크 타임", target: "venues" },
  { id: "night-rumor", minuteOfDay: 1380, label: "밤 루머/위험 사건", target: "internet.community" }
];

export function dueTimeEvents(previousMinute, currentMinute) {
  return repeatingTimeEvents.filter((event) => crossedMinute(previousMinute, currentMinute, event.minuteOfDay));
}

function phaseForMinute(minute) {
  if (minute >= 300 && minute < 420) {
    return { key: "dawn", label: "새벽", overlayColor: "rgba(43, 54, 80, 0.22)", overlayAlpha: 0.22 };
  }
  if (minute >= 420 && minute < 1080) {
    return { key: "day", label: "낮", overlayColor: "rgba(255, 244, 204, 0.04)", overlayAlpha: 0.04 };
  }
  if (minute >= 1080 && minute < 1260) {
    return { key: "evening", label: "저녁", overlayColor: "rgba(91, 45, 42, 0.20)", overlayAlpha: 0.20 };
  }
  return { key: "night", label: "밤", overlayColor: "rgba(7, 13, 34, 0.46)", overlayAlpha: 0.46 };
}

function crossedMinute(previous, current, target) {
  if (previous === current) return false;
  if (previous < current) return previous < target && target <= current;
  return target > previous || target <= current;
}

function clampMinute(value) {
  return ((Math.round(value) % 1440) + 1440) % 1440;
}

function pad(value) {
  return String(value).padStart(2, "0");
}
