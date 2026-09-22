import { create } from 'zustand'
import type { WindowScene, SceneFormData, TimePeriod } from '@/types'
import {
  getAllScenes,
  saveScene as storageSaveScene,
  deleteScene as storageDeleteScene,
  getScenesByRoute,
  getAllRouteNames,
  getRandomScene,
  getLatestSceneByRoute,
} from '@/services/storage'
import { resolveAutoPeriod } from '@/utils/timePeriod'

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

  saveScene: (data: SceneFormData) => {
    const timestamp = new Date().toISOString()
    const { timePeriodChoice, ...rest } = data
    // 手动选择只影响本次；自动档优先沿用同线路最近记录，无历史再按小时判定
    const timePeriod: TimePeriod =
      timePeriodChoice === '自动'
        ? resolveAutoPeriod(timestamp, getLatestSceneByRoute(data.routeName))
        : timePeriodChoice
    const scene: WindowScene = {
      ...rest,
      id: crypto.randomUUID(),
      timestamp,
      timePeriod,
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

  deleteScene: (id: string) => {
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
