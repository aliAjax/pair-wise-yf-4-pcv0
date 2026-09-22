import type {
  Weather,
  TreeDensity,
  PedestrianStatus,
  ObservationPeriod,
  ResolvedPeriod,
  WindowScene,
} from '@/types'
import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudFog,
  TreePine, TreePine as TreeSparse, Trees,
  PersonStanding, Users,
} from 'lucide-react'

/** 记录页五档时段，自动档排在首位 */
export const PERIOD_OPTIONS: ObservationPeriod[] = ['自动', '清晨', '白天', '傍晚', '夜间']

/** 时间线筛选用（不含自动档） */
export const RESOLVED_PERIODS: ResolvedPeriod[] = ['清晨', '白天', '傍晚', '夜间']

/** 按小时兜底判断：5-9 清晨、9-17 白天、17-20 傍晚、其余夜间（区间左闭右开） */
export function getPeriodByHour(iso: string): ResolvedPeriod {
  const h = new Date(iso).getHours()
  if (h >= 5 && h < 9) return '清晨'
  if (h >= 9 && h < 17) return '白天'
  if (h >= 17 && h < 20) return '傍晚'
  return '夜间'
}

/** 读取记录上保存的时段，旧记录没有该字段时按时间戳补算 */
export function resolveScenePeriod(scene: WindowScene): ResolvedPeriod {
  return scene.period ?? getPeriodByHour(scene.timestamp)
}

/**
 * 保存自动档时的解析规则：
 * 优先沿用同线路最近一条记录的时段；没有历史再按小时判断。
 */
export function resolveAutoPeriod(
  iso: string,
  routeScenes: WindowScene[],
): ResolvedPeriod {
  if (routeScenes.length > 0) {
    const latest = routeScenes.reduce((a, b) =>
      new Date(a.timestamp).getTime() >= new Date(b.timestamp).getTime() ? a : b,
    )
    return resolveScenePeriod(latest)
  }
  return getPeriodByHour(iso)
}

export function getWeatherIcon(weather: Weather) {
  const map: Record<Weather, React.ReactNode> = {
    '晴': <Sun className="w-4 h-4 text-dusk-400" />,
    '多云': <Cloud className="w-4 h-4 text-mist-400" />,
    '阴': <Cloud className="w-4 h-4 text-mist-500" />,
    '小雨': <CloudDrizzle className="w-4 h-4 text-blue-400" />,
    '大雨': <CloudRain className="w-4 h-4 text-blue-500" />,
    '雪': <CloudSnow className="w-4 h-4 text-mist-200" />,
    '雾': <CloudFog className="w-4 h-4 text-mist-400" />,
  }
  return map[weather]
}

export function getTreeIcon(density: TreeDensity) {
  const map: Record<TreeDensity, React.ReactNode> = {
    '稀疏': <TreeSparse className="w-4 h-4 text-green-600" />,
    '适中': <TreePine className="w-4 h-4 text-green-500" />,
    '茂密': <Trees className="w-4 h-4 text-green-400" />,
  }
  return map[density]
}

export function getPedestrianIcon(status: PedestrianStatus) {
  const map: Record<PedestrianStatus, React.ReactNode> = {
    '稀少': <PersonStanding className="w-4 h-4 text-mist-400" />,
    '零星': <PersonStanding className="w-4 h-4 text-dusk-300" />,
    '密集': <Users className="w-4 h-4 text-dusk-400" />,
  }
  return map[status]
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hour}:${minute}`
}

/** @deprecated 时段已改为随记录保存，用 resolveScenePeriod 代替；保留兼容 */
export function getTimeOfDay(iso: string): string {
  return getPeriodByHour(iso)
}

export const WRITING_PROMPTS = [
  '尝试以窗外招牌为线索，写一个关于陌生人的短篇',
  '用树木的密度变化暗示主人公的心境转折',
  '让行人的状态成为故事中某个预兆的隐喻',
  '把天气当作叙事节奏的调节器，写一段场景转换',
  '以座位方向为视角限制，写一段只看到一侧世界的独白',
  '从观察笔记中的一句话出发，展开一篇城市散文',
  '将窗景中所有招牌串联成一条线索，写一个悬疑片段',
  '用行人的姿态写一首自由诗',
  '以"窗外"为题，把这段记录扩写成五百字的微型小说',
  '从树木间隙中想象一个被遮挡的完整故事',
  '用天气和行人密度写一段氛围描写',
  '把窗景当作一幅画，为它写一段策展词',
]
