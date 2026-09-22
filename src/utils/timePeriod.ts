export type TimePeriod = '清晨' | '白天' | '傍晚' | '夜间'

/** 记录页可选项，自动档不入库，保存时解析为具体时段 */
export type TimePeriodChoice = '自动' | TimePeriod

export const TIME_PERIODS: TimePeriod[] = ['清晨', '白天', '傍晚', '夜间']
export const TIME_PERIOD_CHOICES: TimePeriodChoice[] = ['自动', ...TIME_PERIODS]

export function isTimePeriod(value: unknown): value is TimePeriod {
  return (
    value === '清晨' || value === '白天' || value === '傍晚' || value === '夜间'
  )
}

/**
 * 按本地小时判定时段：
 * 5-9 清晨、9-17 白天、17-20 傍晚、其余夜间（区间为 [起, 止)）
 */
export function periodFromTimestamp(timestamp: string): TimePeriod {
  const h = new Date(timestamp).getHours()
  if (h >= 5 && h < 9) return '清晨'
  if (h >= 9 && h < 17) return '白天'
  if (h >= 17 && h < 20) return '傍晚'
  return '夜间'
}

/**
 * 自动档解析：优先沿用同线路最近一条记录的时段，没有历史再按时间戳判定。
 */
export function resolveAutoPeriod(
  timestamp: string,
  latestSameRoute: { timePeriod?: string } | null | undefined
): TimePeriod {
  if (latestSameRoute && isTimePeriod(latestSameRoute.timePeriod)) {
    return latestSameRoute.timePeriod
  }
  return periodFromTimestamp(timestamp)
}
