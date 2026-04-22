import { Kicker } from '@/components/Kicker'
import { DosAndDonts, Do, Dont } from '@/components/DosAndDonts'
import {
  Heart, MapPin, Star, Camera, Music, Utensils, Flower, Calendar, Users, ShieldCheck,
  Sparkles, ArrowRight, ArrowLeft, Check, ChevronDown, Search, Clock, MessageCircle, Eye, TrendingUp,
} from 'lucide-react'

const icons = [Heart, MapPin, Star, Camera, Music, Utensils, Flower, Calendar, Users, ShieldCheck, Sparkles, ArrowRight, ArrowLeft, Check, ChevronDown, Search, Clock, MessageCircle, Eye, TrendingUp]

export default function IconographyPage() {
  return (
    <>
      <Kicker>Foundations · Iconography</Kicker>
      <h1 className="display text-4xl md:text-6xl lg:text-[72px] leading-[0.9]">
        Lucide.
        <br />
        Nothing else.
      </h1>
      <p className="mt-8 text-lg text-gray-600 max-w-2xl font-medium leading-relaxed">
        One icon library —{' '}
        <code className="mono text-[0.88em] bg-gray-100 rounded px-1.5 py-0.5">lucide-react</code>.
        Stroke 2 default, 2.5 for directional glyphs (arrows/chevrons) on bold surfaces. Never mix
        two icon families on one screen.
      </p>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Common set
      </h2>
      <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
        {icons.map((Icon, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-700"
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Find more at <a href="https://lucide.dev" className="underline" target="_blank" rel="noreferrer">lucide.dev</a>.
      </p>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Sizes
      </h2>
      <div className="flex flex-wrap gap-5 items-end">
        {[12, 14, 16, 20, 28, 36].map((size) => (
          <div key={size} className="text-center">
            <div
              className="rounded-xl border border-gray-100 flex items-center justify-center"
              style={{ width: size * 2, height: size * 2 }}
            >
              <Clock size={size} strokeWidth={size >= 36 ? 2.5 : 2} />
            </div>
            <p className="mt-2 text-xs font-bold">{size}px</p>
          </div>
        ))}
      </div>

      <h2 className="font-black uppercase tracking-tight text-2xl md:text-3xl mt-14 mb-5 text-ink">
        Icon containers
      </h2>
      <div className="flex flex-wrap gap-5 items-end">
        <div className="text-center">
          <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
            <MapPin size={13} />
          </div>
          <p className="mt-2 text-xs font-bold">Mega-menu</p>
          <p className="text-[10px] text-gray-500">28×28 · gray-100</p>
        </div>
        <div className="text-center">
          <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
            <Heart size={15} />
          </div>
          <p className="mt-2 text-xs font-bold">Mobile row</p>
          <p className="text-[10px] text-gray-500">32×32 · shadow-sm</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center">
            <Users size={20} />
          </div>
          <p className="mt-2 text-xs font-bold">Trust block</p>
          <p className="text-[10px] text-gray-500">48×48 · outline</p>
        </div>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-[var(--accent)] text-[var(--on-accent)] flex items-center justify-center">
            <ArrowRight size={22} strokeWidth={2.5} />
          </div>
          <p className="mt-2 text-xs font-bold">Carousel ctl</p>
          <p className="text-[10px] text-gray-500">56×56 · accent</p>
        </div>
      </div>

      <DosAndDonts>
        <Do>Use lucide-react. Stroke 2 default.</Do>
        <Dont>Mix Feather, Heroicons, or Material with Lucide on the same screen.</Dont>
        <Do>Bump stroke to 2.5 for arrows/chevrons on bold or accent surfaces.</Do>
        <Dont>Use filled glyphs — Lucide is a stroke-first library.</Dont>
      </DosAndDonts>
    </>
  )
}
