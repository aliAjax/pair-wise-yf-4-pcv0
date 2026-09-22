import { useState, useEffect } from 'react'
import { Bus, MapPin, Armchair, Clock, CloudSun, Signpost, TreePine, Users, FileText, Send, Sunrise, Sun, Sunset, Moon, Wand2 } from 'lucide-react'
import { useSceneStore } from '@/store/useSceneStore'
import { getWeatherIcon, getTreeIcon, getPedestrianIcon, formatTimestamp, PERIOD_OPTIONS, resolveAutoPeriod } from '@/utils/sceneHelpers'
import type { SceneFormData, Weather, TreeDensity, PedestrianStatus, SeatDirection, ObservationPeriod } from '@/types'

const WEATHERS: Weather[] = ['晴', '多云', '阴', '小雨', '大雨', '雪', '雾']
const TREES: TreeDensity[] = ['稀疏', '适中', '茂密']
const PEDESTRIANS: PedestrianStatus[] = ['稀少', '零星', '密集']

const PERIOD_ICONS: Record<ObservationPeriod, React.ReactNode> = {
  '自动': <Wand2 className="w-3.5 h-3.5" />,
  '清晨': <Sunrise className="w-3.5 h-3.5" />,
  '白天': <Sun className="w-3.5 h-3.5" />,
  '傍晚': <Sunset className="w-3.5 h-3.5" />,
  '夜间': <Moon className="w-3.5 h-3.5" />,
}

const initialForm: SceneFormData = {
  routeName: '',
  segment: '',
  seatDirection: '左',
  weather: '晴',
  signText: '',
  treeDensity: '适中',
  pedestrianStatus: '稀少',
  note: '',
  period: '自动',
}

export default function RecordPage() {
  const saveScene = useSceneStore((s) => s.saveScene)
  const loadAll = useSceneStore((s) => s.loadAll)
  const scenes = useSceneStore((s) => s.scenes)
  const [form, setForm] = useState<SceneFormData>(initialForm)
  const [now, setNow] = useState(new Date())
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const update = <K extends keyof SceneFormData>(key: K, val: SceneFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  // 自动档的预解析结果（仅用于提示，保存时再计算）
  const sameRouteScenes = form.routeName.trim()
    ? scenes.filter((s) => s.routeName === form.routeName.trim())
    : []
  const autoResolved = resolveAutoPeriod(now.toISOString(), sameRouteScenes)
  const autoHintSource = sameRouteScenes.length > 0
    ? `将沿用「${form.routeName.trim()}」最近记录的时段`
    : '该线路暂无历史，按当前时间判断'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveScene(form)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setForm(initialForm)
    }, 1500)
  }

  return (
    <div className="relative min-h-screen bg-teal-950 p-4 pb-24">
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce flex flex-col items-center gap-2 opacity-0" style={{ animation: 'fadeInUp 1.5s ease forwards' }}>
            <Bus className="w-16 h-16 text-dusk-400" />
            <span className="text-mist-100 font-serif text-lg">记录已保存</span>
          </div>
          <style>{`@keyframes fadeInUp { 0% { opacity:0; transform:translateY(20px) } 40% { opacity:1; transform:translateY(0) } 100% { opacity:0; transform:translateY(-40px) } }`}</style>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Bus className="w-6 h-6 text-dusk-400" />
          <h1 className="text-mist-100 font-serif text-2xl">窗景记录</h1>
        </div>

        <section className="space-y-3">
          <h2 className="text-dusk-400 font-serif text-lg flex items-center gap-2">
            <MapPin className="w-4 h-4" />路线信息
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-mist-300 text-xs mb-1 flex items-center gap-1"><Bus className="w-3 h-3" />线路</label>
              <input className="w-full bg-teal-850 text-mist-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-dusk-400" value={form.routeName} onChange={(e) => update('routeName', e.target.value)} required />
            </div>
            <div>
              <label className="text-mist-300 text-xs mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />区间</label>
              <input className="w-full bg-teal-850 text-mist-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-dusk-400" value={form.segment} onChange={(e) => update('segment', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-mist-300 text-xs mb-1 flex items-center gap-1"><Armchair className="w-3 h-3" />座位方向</label>
            <div className="flex gap-2">
              {(['左', '右'] as SeatDirection[]).map((d) => (
                <button key={d} type="button" onClick={() => update('seatDirection', d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${form.seatDirection === d ? 'bg-dusk-400/20 text-dusk-400 border border-dusk-400' : 'bg-teal-850 text-mist-300 border border-transparent'}`}>
                  {d}侧
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-mist-300 text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" />观察时段</label>
            <div className="grid grid-cols-5 gap-2">
              {PERIOD_OPTIONS.map((p) => (
                <button key={p} type="button" onClick={() => update('period', p)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition ${form.period === p ? 'bg-dusk-400/20 border border-dusk-400 text-dusk-400' : 'bg-teal-850 border border-transparent text-mist-300'}`}>
                  {PERIOD_ICONS[p]}{p}
                </button>
              ))}
            </div>
            {form.period === '自动' && (
              <p className="mt-1.5 text-[11px] text-mist-500 flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                {autoHintSource}，本次将记为「{autoResolved}」；手动选择只影响本次
              </p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-dusk-400 font-serif text-lg flex items-center gap-2">
            <CloudSun className="w-4 h-4" />窗景信息
          </h2>
          <div>
            <label className="text-mist-300 text-xs mb-1 block">天气</label>
            <div className="grid grid-cols-4 gap-2">
              {WEATHERS.map((w) => (
                <button key={w} type="button" onClick={() => update('weather', w)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition ${form.weather === w ? 'bg-dusk-400/20 border border-dusk-400 text-dusk-400' : 'bg-teal-850 border border-transparent text-mist-300'}`}>
                  {getWeatherIcon(w)}{w}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-mist-300 text-xs mb-1 flex items-center gap-1"><Signpost className="w-3 h-3" />招牌文字</label>
            <input className="w-full bg-teal-850 text-mist-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-dusk-400" value={form.signText} onChange={(e) => update('signText', e.target.value)} />
          </div>
          <div>
            <label className="text-mist-300 text-xs mb-1 flex items-center gap-1"><TreePine className="w-3 h-3" />树木密度</label>
            <div className="grid grid-cols-3 gap-2">
              {TREES.map((t) => (
                <button key={t} type="button" onClick={() => update('treeDensity', t)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs transition ${form.treeDensity === t ? 'bg-dusk-400/20 border border-dusk-400 text-dusk-400' : 'bg-teal-850 border border-transparent text-mist-300'}`}>
                  {getTreeIcon(t)}{t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-mist-300 text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" />行人状态</label>
            <div className="grid grid-cols-3 gap-2">
              {PEDESTRIANS.map((p) => (
                <button key={p} type="button" onClick={() => update('pedestrianStatus', p)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl text-xs transition ${form.pedestrianStatus === p ? 'bg-dusk-400/20 border border-dusk-400 text-dusk-400' : 'bg-teal-850 border border-transparent text-mist-300'}`}>
                  {getPedestrianIcon(p)}{p}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-dusk-400 font-serif text-lg flex items-center gap-2">
            <FileText className="w-4 h-4" />观察笔记
          </h2>
          <textarea className="w-full bg-teal-850 text-mist-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-dusk-400 resize-none h-24" value={form.note} onChange={(e) => update('note', e.target.value)} />
        </section>

        <div className="flex items-center gap-2 text-mist-400 text-xs">
          <Clock className="w-3 h-3" />
          <span>{formatTimestamp(now.toISOString())}</span>
        </div>

        <button type="submit"
          className="w-full py-3 rounded-xl bg-dusk-400 text-teal-950 font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition">
          <Send className="w-4 h-4" />保存记录
        </button>
      </form>
    </div>
  )
}
