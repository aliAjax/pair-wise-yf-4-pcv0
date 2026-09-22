export type SeatDirection = '左' | '右'

export type Weather = '晴' | '多云' | '阴' | '小雨' | '大雨' | '雪' | '雾'

export type TreeDensity = '稀疏' | '适中' | '茂密'

export type PedestrianStatus = '稀少' | '零星' | '密集'

/** 观察时段：自动档保存时按规则解析为其余四档之一 */
export type ObservationPeriod = '自动' | '清晨' | '白天' | '傍晚' | '夜间'

/** 已保存记录上的确定时段（自动档解析后的结果） */
export type ResolvedPeriod = Exclude<ObservationPeriod, '自动'>

export interface WindowScene {
  id: string
  routeName: string
  segment: string
  seatDirection: SeatDirection
  timestamp: string
  weather: Weather
  signText: string
  treeDensity: TreeDensity
  pedestrianStatus: PedestrianStatus
  note: string
  /** 观察时段，随本地记录保存；旧记录缺失时按时间戳补算 */
  period?: ResolvedPeriod
}

export interface SceneFormData {
  routeName: string
  segment: string
  seatDirection: SeatDirection
  weather: Weather
  signText: string
  treeDensity: TreeDensity
  pedestrianStatus: PedestrianStatus
  note: string
  /** 观察时段选择，默认自动 */
  period: ObservationPeriod
}
