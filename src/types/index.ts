export type SeatDirection = '左' | '右'

export type Weather = '晴' | '多云' | '阴' | '小雨' | '大雨' | '雪' | '雾'

export type TreeDensity = '稀疏' | '适中' | '茂密'

export type PedestrianStatus = '稀少' | '零星' | '密集'

export type TimePeriod = '清晨' | '白天' | '傍晚' | '夜间'

/** 记录页五档；自动档仅用于本次填写，保存时解析为具体时段 */
export type TimePeriodChoice = '自动' | TimePeriod

export interface WindowScene {
  id: string
  routeName: string
  segment: string
  seatDirection: SeatDirection
  timestamp: string
  timePeriod: TimePeriod
  weather: Weather
  signText: string
  treeDensity: TreeDensity
  pedestrianStatus: PedestrianStatus
  note: string
}

export interface SceneFormData {
  routeName: string
  segment: string
  seatDirection: SeatDirection
  timePeriodChoice: TimePeriodChoice
  weather: Weather
  signText: string
  treeDensity: TreeDensity
  pedestrianStatus: PedestrianStatus
  note: string
}
