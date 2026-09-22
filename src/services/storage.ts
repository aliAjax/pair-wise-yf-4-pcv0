import type { WindowScene } from '@/types'
import { getPeriodByHour } from '@/utils/sceneHelpers'

const STORAGE_KEY = 'bus_window_scenes'

export function getAllScenes(): WindowScene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const scenes = JSON.parse(raw) as WindowScene[]
    return migrateScenes(scenes)
  } catch {
    return []
  }
}

/**
 * 数据迁移：旧记录没有 period 字段时按时间戳补算，
 * 补算结果写回本地，随记录一起保存。
 */
function migrateScenes(scenes: WindowScene[]): WindowScene[] {
  let changed = false
  const migrated = scenes.map((s) => {
    if (s.period) return s
    changed = true
    return { ...s, period: getPeriodByHour(s.timestamp) }
  })
  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
  }
  return migrated
}

export function saveScene(scene: WindowScene): void {
  const scenes = getAllScenes()
  scenes.push(scene)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
}

export function deleteScene(id: string): void {
  const scenes = getAllScenes().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
}

export function getScenesByRoute(routeName: string): WindowScene[] {
  return getAllScenes()
    .filter((s) => s.routeName === routeName)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getAllRouteNames(): string[] {
  const scenes = getAllScenes()
  const routeSet = new Set(scenes.map((s) => s.routeName))
  return Array.from(routeSet).sort()
}

export function getRandomScene(): WindowScene | null {
  const scenes = getAllScenes()
  if (scenes.length === 0) return null
  return scenes[Math.floor(Math.random() * scenes.length)]
}
