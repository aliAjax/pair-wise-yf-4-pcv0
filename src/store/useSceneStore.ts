import { create } from 'zustand'
import type { WindowScene, SceneFormData, ResolvedPeriod } from '@/types'
import {
  getAllScenes,
  saveScene as storageSaveScene,
  deleteScene as storageDeleteScene,
  getScenesByRoute,
  getAllRouteNames,
  getRandomScene,
} from '@/services/storage'
import { resolveAutoPeriod } from '@/utils/sceneHelpers'

interface SceneState {
  scenes: WindowScene[]
  routeNames: string[]
  currentRouteScenes: WindowScene[]
  selectedRoute: string
  randomScene: WindowScene | null

  loadAll: () => void
  saveScene: (data: SceneFormData) => void
  deleteScene: (id: string) => void
  selectRoute: (routeName: string) => void
  refreshRandom: () => void
}

export const useSceneStore = create<SceneState>((set) => ({
  scenes: [],
  routeNames: [],
  currentRouteScenes: [],
  selectedRoute: '',
  randomScene: null,

  loadAll: () => {
    const scenes = getAllScenes()
    const routeNames = getAllRouteNames()
    set({ scenes, routeNames })
  },

  saveScene: (data) => {
    const timestamp = new Date().toISOString()
    // 自动档：优先沿用同线路最近记录的时段，没有历史再按小时判断；
    // 手动选择只影响本次。
    const sameRouteScenes = getAllScenes().filter(
      (s) => s.routeName === data.routeName.trim(),
    )
    const period: ResolvedPeriod =
      data.period === '自动'
        ? resolveAutoPeriod(timestamp, sameRouteScenes)
        : data.period
    const scene: WindowScene = {
      ...data,
      routeName: data.routeName.trim(),
      period,
      id: crypto.randomUUID(),
      timestamp,
    }
    storageSaveScene(scene)
    const scenes = getAllScenes()
    const routeNames = getAllRouteNames()
    set((state) => {
      const currentRouteScenes =
        state.selectedRoute ? getScenesByRoute(state.selectedRoute) : []
      return { scenes, routeNames, currentRouteScenes }
    })
  },

  deleteScene: (id) => {
    storageDeleteScene(id)
    const scenes = getAllScenes()
    const routeNames = getAllRouteNames()
    set((state) => {
      const currentRouteScenes =
        state.selectedRoute ? getScenesByRoute(state.selectedRoute) : []
      return { scenes, routeNames, currentRouteScenes }
    })
  },

  selectRoute: (routeName: string) => {
    const currentRouteScenes = routeName ? getScenesByRoute(routeName) : []
    set({ selectedRoute: routeName, currentRouteScenes })
  },

  refreshRandom: () => {
    const randomScene = getRandomScene()
    set({ randomScene })
  },
}))
