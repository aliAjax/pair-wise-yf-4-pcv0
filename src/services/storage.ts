import type { WindowScene } from '@/types'
import { periodFromTimestamp, isTimePeriod } from '@/utils/timePeriod'

const STORAGE_KEY = 'bus_window_scenes'

function normalize(scene: WindowScene): WindowScene {
  // 旧记录没有时段字段，按时间戳补算，并随本地记录保存
  if (!isTimePeriod(scene.timePeriod)) {
    return { ...scene, timePeriod: periodFromTimestamp(scene.timestamp) }
  }
  return scene
}

export function getAllScenes(): WindowScene[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as WindowScene[]
    let changed = false
    const scenes = parsed.map((s) => {
      const n = normalize(s)
      if (n !== s) changed = true
      return n
    })
    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenes))
    }
    return scenes
  } catch {
    return []
  }
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

/**
 * 获取某条线路最近一条记录（自动档优先沿用其时段）。
 */
export function getLatestSceneByRoute(routeName: string): WindowScene | null {
  if (!routeName) return null
  const byRoute = getAllScenes()
    .filter((s) => s.routeName === routeName)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return byRoute[0] ?? null
}
